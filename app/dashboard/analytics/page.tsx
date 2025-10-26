"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useSearchParams } from "next/navigation";

type PhishingLog = {
  id: string;
  campaignId: string;
  employeeId: string;
  platform: string;
  action: "sent" | "clicked" | "submitted"; // changed: include "sent"
  timestamp: string;
  data?: any;
  employeeName?: string;
  employeeEmail?: string;
  employeeDepartment?: string;
};

type Employee = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
};

// Helper: normalize one employee (supports dept/team keys)
function normalizeEmployee(e: any): Employee {
  return {
    id: String(e.id),
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    department: e.department || e.dept || e.team || undefined,
  };
}

// Helper: normalize employees API JSON (supports {employees}, {data}, [] shapes)
function normalizeEmployeesJson(json: any): Employee[] {
  const arr = json?.employees ?? json?.data ?? json;
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeEmployee);
}

// Merge API employees with logs (fill missing or missing departments from logs)
function mergeEmployeesWithLogs(apiEmployees: Employee[], logs: PhishingLog[]): Employee[] {
  const byId = new Map<string, Employee>();
  apiEmployees.forEach((e) => byId.set(String(e.id), { ...e, department: e.department || "Unknown" }));

  for (const l of logs) {
    const id = String(l.employeeId);
    const existing = byId.get(id);
    const deptFromLog = l.employeeDepartment;
    if (!existing) {
      byId.set(id, {
        id,
        email: l.employeeEmail,
        department: deptFromLog || "Unknown",
      });
    } else if (!existing.department && deptFromLog) {
      byId.set(id, { ...existing, department: deptFromLog });
    }
  }
  return Array.from(byId.values());
}

// Pair key helper (per employee per campaign)
function pairKey(empId: string, campId: string) {
  return `${empId}::${campId}`;
}

export default function Page() {
  const [logs, setLogs] = useState<PhishingLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const sp = useSearchParams();
  const userId = sp.get("userId") || ""; // pass ?userId=... in the URL

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // Fetch logs (must include employeeDepartment from API)
        const logsRes = await fetch("/api/phishing/log?includeEmployee=1", { cache: "no-store" });
        const logsJson = await logsRes.json();
        const logsData: PhishingLog[] = logsJson?.logs ?? [];

        // Fetch employees and normalize
        let emps: Employee[] = [];
        try {
          const empRes = await fetch(`/api/employees?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
          if (empRes.ok) {
            const empJson = await empRes.json();
            emps = normalizeEmployeesJson(empJson);
          } else {
            const empRes2 = await fetch("/api/employee", { cache: "no-store" });
            if (empRes2.ok) {
              const empJson2 = await empRes2.json();
              emps = normalizeEmployeesJson(empJson2);
            }
          }
        } catch {
          // ignore
        }

        // If empty, seed from logs
        if (!emps || emps.length === 0) {
          const byId = new Map<string, Employee>();
          for (const l of logsData) {
            const id = String(l.employeeId);
            if (!byId.has(id)) {
              byId.set(id, {
                id,
                email: l.employeeEmail,
                department: l.employeeDepartment || "Unknown",
              });
            }
          }
          emps = Array.from(byId.values());
        }

        // Always merge with logs to ensure departments exist
        const merged = mergeEmployeesWithLogs(emps, logsData);

        if (!cancelled) {
          setLogs(logsData);
          setEmployees(merged);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load analytics data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Build department list from employees (or from logs if needed)
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.department || "Unknown"));
    if (set.size === 0) set.add("Unknown");
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // Compute per-department rates using "sent" as denominator
  const chartDataRates = useMemo(() => {
    // Lookup department per employeeId
    const deptOf = (empId: string) => {
      const e = employees.find((x) => String(x.id) === String(empId));
      return (e?.department || "Unknown") as string;
    };

    // Sets of unique pairs per department
    const sentByDept = new Map<string, Set<string>>();
    const clickedByDept = new Map<string, Set<string>>();
    const submittedByDept = new Map<string, Set<string>>();

    // Per-employee campaign timelines based on sent, with fail status from click/submit
    const sentTimeline = new Map<
      string,
      { campaignId: string; ts: number }[]
    >();
    const failedPairs = new Set<string>(); // pairKey failed (click or submit)

    for (const l of logs) {
      const dept = deptOf(l.employeeId);
      if (l.action === "sent") {
        if (!sentByDept.has(dept)) sentByDept.set(dept, new Set());
        sentByDept.get(dept)!.add(pairKey(l.employeeId, l.campaignId));
        const arr = sentTimeline.get(l.employeeId) || [];
        arr.push({ campaignId: l.campaignId, ts: new Date(l.timestamp).getTime() });
        sentTimeline.set(l.employeeId, arr);
      } else if (l.action === "clicked") {
        if (!clickedByDept.has(dept)) clickedByDept.set(dept, new Set());
        clickedByDept.get(dept)!.add(pairKey(l.employeeId, l.campaignId));
        failedPairs.add(pairKey(l.employeeId, l.campaignId));
      } else if (l.action === "submitted") {
        if (!submittedByDept.has(dept)) submittedByDept.set(dept, new Set());
        submittedByDept.get(dept)!.add(pairKey(l.employeeId, l.campaignId));
        failedPairs.add(pairKey(l.employeeId, l.campaignId));
      }
    }

    // If you don’t have “sent” logs yet, fallback to headcount-based denominator to avoid NaN
    const noSentData = Array.from(sentByDept.values()).reduce((a, s) => a + s.size, 0) === 0;

    // Compute repeat offender by department using sent sequence
    function repeatOffenderRateByDept(dept: string): { rate: number; offenders: number; eligible: number } {
      let offenders = 0;
      let eligible = 0;

      // Employees in this dept
      const empIds = employees.filter((e) => (e.department || "Unknown") === dept).map((e) => String(e.id));

      for (const empId of empIds) {
        const sentArr = (sentTimeline.get(empId) || []).slice().sort((a, b) => a.ts - b.ts);
        if (sentArr.length < 2) continue; // needs at least 2 sent campaigns to be eligible
        eligible += 1;

        let streak = 0;
        let isRepeat = false;

        for (const s of sentArr) {
          const failed = failedPairs.has(pairKey(empId, s.campaignId));
          if (failed) {
            streak += 1;
            if (streak >= 2) {
              isRepeat = true;
              break;
            }
          } else {
            streak = 0;
          }
        }
        if (isRepeat) offenders += 1;
      }

      const rate = eligible > 0 ? Number(((offenders / eligible) * 100).toFixed(1)) : 0;
      return { rate, offenders, eligible };
    }

    // Build chart rates
    return departments.map((dept) => {
      const sent = sentByDept.get(dept)?.size || 0;
      const clicked = clickedByDept.get(dept)?.size || 0;
      const submitted = submittedByDept.get(dept)?.size || 0;

      const clickRate = noSentData
        ? 0
        : sent > 0
        ? Number(((clicked / sent) * 100).toFixed(1))
        : 0;

      const submissionRate = noSentData
        ? 0
        : sent > 0
        ? Number(((submitted / sent) * 100).toFixed(1))
        : 0;

      const repeat = repeatOffenderRateByDept(dept);

      return {
        department: dept,
        "Click Rate": clickRate,
        "Submission Rate": submissionRate,
        "Repeat Offender Rate": repeat.rate,
        _sent: sent,
        _clickedPairs: clicked,
        _submittedPairs: submitted,
        _repeatEligible: repeat.eligible,
        _repeatOffenders: repeat.offenders,
      };
    });
  }, [logs, employees, departments]);

  const allUnknownDepartments = useMemo(() => {
    const unique = new Set(employees.map((e) => e.department || "Unknown"));
    return unique.size === 1 && unique.has("Unknown");
  }, [employees]);

  if (loading) return <div className="text-black/70">Loading analytics...</div>;
  if (err) return <div className="text-red-600">Error: {err}</div>;

  return (
    <div className="space-y-6">
      {/* Themed header card */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-black">Analytics</h1>
        <p className="text-sm text-black/70">Click Rate, Submission Rate, and Repeat Offender Rate by department</p>
      </div>

      {/* Hint if departments missing */}
      {allUnknownDepartments && (
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="bg-white rounded-xl border border-yellow-300 p-4">
            <p className="text-sm text-yellow-800">
              No department data detected. Ensure your logs API returns employeeDepartment, or your employees API includes department for each user (e.g., IT, HR).
            </p>
          </div>
        </div>
      )}

      {/* Three metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Click Rate */}
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-black text-lg">🖱️</span>
              <h2 className="text-base font-semibold text-black">Click Rate by Department</h2>
            </div>
            <span className="text-xs text-black/60">0–100%</span>
          </div>
          <div className="bg-white rounded-xl border border-black/10 p-3">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataRates} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="department" angle={-20} textAnchor="end" height={60} tick={{ fill: "#111827" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#111827" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "Click Rate"]} labelStyle={{ color: "#000" }} contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }} />
                  <Bar dataKey="Click Rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-black/60 mt-2">Percent of employees who clicked at least once.</div>
          </div>
        </div>

        {/* Submission Rate */}
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-black text-lg">⚠️</span>
              <h2 className="text-base font-semibold text-black">Submission Rate by Department</h2>
            </div>
            <span className="text-xs text-black/60">0–100%</span>
          </div>
          <div className="bg-white rounded-xl border border-black/10 p-3">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataRates} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="department" angle={-20} textAnchor="end" height={60} tick={{ fill: "#111827" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#111827" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "Submission Rate"]} labelStyle={{ color: "#000" }} contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }} />
                  <Bar dataKey="Submission Rate" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-black/60 mt-2">Percent of employees who submitted credentials.</div>
          </div>
        </div>

        {/* Repeat Offender Rate */}
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-black text-lg">🔁</span>
              <h2 className="text-base font-semibold text-black">Repeat Offender Rate by Department</h2>
            </div>
            <span className="text-xs text-black/60">0–100%</span>
          </div>
          <div className="bg-white rounded-xl border border-black/10 p-3">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataRates} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="department" angle={-20} textAnchor="end" height={60} tick={{ fill: "#111827" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#111827" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "Repeat Offender Rate"]} labelStyle={{ color: "#000" }} contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }} />
                  <Bar dataKey="Repeat Offender Rate" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-black/60 mt-2">Percent failing 2+ consecutive campaigns.</div>
          </div>
        </div>
      </div>

      {/* Details table in themed card */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <div className="bg-white rounded-xl border border-black/10 p-4 overflow-auto">
          <h2 className="text-base font-semibold text-black mb-3">Details</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Department</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Clicked</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Submitted</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Repeat</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartDataRates.map((row) => (
                <tr key={row.department}>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.department}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row._sent}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row._clickedPairs}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row._submittedPairs}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row._repeatOffenders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}