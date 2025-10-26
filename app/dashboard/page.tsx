"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Update the PhishingLog type at the top of the file
type PhishingLog = {
  id: string;
  employeeId: string;
  action: "sent" | "clicked" | "submitted"; // Make sure "sent" is included in type
  timestamp: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeDepartment?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<PhishingLog[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchEmployeeCount(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/phishing/log?includeEmployee=1");
        const data = await res.json();

        // Fix: Strict filtering for clicked/submitted only
        const filteredLogs = data.logs.filter((log: PhishingLog) => {
          // Only include if action is exactly "clicked" or "submitted"
          return log.action === "clicked" || log.action === "submitted";
        });

        console.log("All logs:", data.logs); // Debug: see all logs
        console.log("Filtered logs:", filteredLogs); // Debug: see what's included

        setLogs(filteredLogs);
      } catch (err) {
        console.error("Failed to load logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const fetchEmployeeCount = async (userId: string) => {
    try {
      const response = await fetch(`/api/employees?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeCount(data.employees?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch employee count:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-black mb-2">
          Welcome to MySimFisher, {user.username}! 👋
        </h1>
        <p className="text-black/70 text-lg">
          Ready to create your next campaign?
        </p>
      </div>

      {/* Campaign Generation Steps */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-black mb-6">
          Create a Campaign in 3 Simple Steps
        </h2>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 bg-[#620089] text-white rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-2">
                👥 Manage Employees
              </h3>
              <p className="text-gray-700 mb-3">
                Add or update your employee list to target the right audience.
              </p>
              <Link
                href="/dashboard/employees"
                className="inline-block bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
              >
                Manage Employees →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 bg-[#620089] text-white rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-2">
                📧 Create Your Campaign
              </h3>
              <p className="text-gray-700 mb-3">
                Set up your campaign details, choose your audience, and craft your message.
              </p>
              <Link
                href="/dashboard/mail-create"
                className="inline-block bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
              >
                Start Creating →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 w-12 h-12 bg-[#620089] text-white rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-2">
                📊 Track Performance
              </h3>
              <p className="text-gray-700 mb-3">
                Monitor your campaign analytics and measure success.
              </p>
              <Link
                href="/dashboard/analytics"
                className="inline-block bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
              >
                View Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-black mb-6">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="text-4xl font-bold text-[#620089] mb-2">0</p>
            <p className="text-sm text-gray-600">Active Campaigns</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center">
            {loading ? (
              <p className="text-4xl font-bold text-[#620089] mb-2">...</p>
            ) : (
              <p className="text-4xl font-bold text-[#620089] mb-2">{employeeCount}</p>
            )}
            <p className="text-sm text-gray-600">Total Employees</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center">
            <p className="text-4xl font-bold text-[#620089] mb-2">0%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.employeeEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.employeeDepartment || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.action === "clicked"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}