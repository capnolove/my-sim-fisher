"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PhishingLog = {
  id: string;
  campaignId: string;
  employeeId: string;
  platform: string;
  action: string;
  timestamp: string;
  data?: any;
  createdAt: string;
  employeeName?: string;   
  employeeEmail?: string;  
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function LogsPage() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<PhishingLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load logs with employee info from server
      const logsRes = await fetch("/api/phishing/log?includeEmployee=1");
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);

      // Optional: local fallback (keep as-is)
      const employeesRaw = localStorage.getItem("employees");
      if (employeesRaw) {
        setEmployees(JSON.parse(employeesRaw));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      return `${employee.firstName} ${employee.lastName}`;
    }
    return employeeId;
  };

  const getEmployeeEmail = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.email || "Unknown";
  };

  // Get unique campaign IDs
  const campaigns = Array.from(new Set(logs.map((log) => log.campaignId)));

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filterPlatform !== "all" && log.platform !== filterPlatform) return false;
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (filterCampaign !== "all" && log.campaignId !== filterCampaign) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    totalClicks: logs.filter((l) => l.action === "clicked").length,
    totalSubmissions: logs.filter((l) => l.action === "submitted").length, 
    uniqueEmployees: new Set(logs.map((l) => l.employeeId)).size,
    campaignCount: campaigns.length,
  };

  const platformStats = {
    google: logs.filter((l) => l.platform === "google").length,
    microsoft: logs.filter((l) => l.platform === "microsoft").length,
    paypal: logs.filter((l) => l.platform === "paypal").length,
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">🏠 Dashboard</h1>
            <p className="text-black/70">
              Track phishing simulation logs
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-[#620089] text-white px-4 py-2 rounded-lg hover:bg-[#4a0068] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="text-sm text-black/60 mb-1">Total Clicks</div>
          <div className="text-3xl font-bold text-black">{stats.totalClicks}</div>
        </div>
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="text-sm text-black/60 mb-1">Credentials Submitted</div>
          <div className="text-3xl font-bold text-red-600">{stats.totalSubmissions}</div>
        </div>
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="text-sm text-black/60 mb-1">Unique Employees</div>
          <div className="text-3xl font-bold text-black">{stats.uniqueEmployees}</div>
        </div>
        <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
          <div className="text-sm text-black/60 mb-1">Campaigns</div>
          <div className="text-3xl font-bold text-black">{stats.campaignCount}</div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <div className="font-semibold text-black mb-4">📊 Platform Breakdown</div>
        <div className="space-y-3">
          {["google", "microsoft", "paypal", "hsbc", "citibank"].map((platform) => {
            const platformLogs = filteredLogs.filter((log) => log.platform === platform);
            const clicks = platformLogs.filter((log) => log.action === "clicked").length;
            const submissions = platformLogs.filter((log) => log.action === "submitted").length;
            const sent = platformLogs.filter((log) => log.action === "sent").length;
            const total = platformLogs.length;

            if (total === 0) return null;

            return (
              <div key={platform} className="bg-white rounded-lg p-3 border border-black/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={`/${platform}.png`} alt={platform} className="h-5" />
                    <span className="font-medium text-black capitalize">{platform}</span>
                  </div>
                  <span className="text-sm text-black/60">{total} total</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    🖱️ {clicks} clicks
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                    ⚠️ {submissions} submissions
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    📨 {sent} sent
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-black mb-4">🔍 Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Platform
            </label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
            >
              <option value="all">All Platforms</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="paypal">PayPal</option>
              <option value="hsbc">HSBC</option>
              <option value="citibank">Citibank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Action
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
            >
              <option value="all">All Actions</option>
              <option value="clicked">Clicked Link</option>
              <option value="submitted">Submitted Credentials</option>
              <option value="sent">Sent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Campaign
            </label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign} value={campaign}>
                  {campaign}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">
            Activity Logs ({filteredLogs.length})
          </h2>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#620089] mx-auto"></div>
            <p className="text-black/60 mt-4">Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-600">No logs found</p>
            <p className="text-sm text-gray-500 mt-2">
              Logs will appear here when employees interact with phishing simulations
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black/20">
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Platform
                  </th>
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Campaign ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-black/10 hover:bg-white/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-black">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-black">
                        {log.employeeName || getEmployeeName(log.employeeId)}
                      </div>
                      <div className="text-xs text-black/60">
                        {log.employeeEmail || getEmployeeEmail(log.employeeId)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={`/${log.platform}.png`}
                          alt={log.platform}
                          className="h-5"
                        />
                        <span className="text-sm text-black capitalize">
                          {log.platform}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {log.action === "clicked" ? (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          🖱️ Clicked
                        </span>
                      ) : log.action === "submitted" ? (
                        <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          ⚠️ Submitted
                        </span>
                      ) : log.action === "sent" ? (
                        <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          📨 Sent
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-xs text-black/60 font-mono">
                      {log.campaignId.substring(0, 20)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-black mb-4">📥 Export Data</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const csv = convertToCSV(filteredLogs);
              downloadCSV(csv, `phishing-logs-${new Date().toISOString()}.csv`);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            📊 Export as CSV
          </button>
          <button
            onClick={() => {
              const json = JSON.stringify(filteredLogs, null, 2);
              downloadJSON(json, `phishing-logs-${new Date().toISOString()}.json`);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            💾 Export as JSON
          </button>
        </div>
      </div>
    </div>
  );

  function convertToCSV(data: PhishingLog[]): string {
    const headers = ["Timestamp", "Employee Name", "Employee Email", "Platform", "Action", "Campaign ID"];
    const rows = data.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.employeeName || getEmployeeName(log.employeeId),
      log.employeeEmail || getEmployeeEmail(log.employeeId),
      log.platform,
      log.action,
      log.campaignId,
    ]);

    return [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
  }

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function downloadJSON(json: string, filename: string) {
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}