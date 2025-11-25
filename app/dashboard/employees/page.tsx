"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  createdAt: string; // Change from Date to string since API returns string
}

export default function EmployeesPage() {
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Single employee form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [router]);

  // Fetch employees when user is set
  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/employees?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Add single employee
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add employee");
      }

      setSuccess("Employee added successfully!");
      setFormData({ firstName: "", lastName: "", email: "", department: "" });
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const text = await file.text();
      console.log("CSV content:", text);

      // Split by newline and filter empty lines
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      
      console.log("Total lines:", lines.length);

      if (lines.length < 2) {
        throw new Error("CSV file must have a header and at least one employee");
      }

      const employees = [];

      // Skip header (index 0), start from index 1
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        // Parse CSV line - handle quoted fields properly
        const parts = line
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""))
          .map((s) => s.trim());

        const [firstName, lastName, email, department] = parts;

        if (firstName && lastName && email) {
          employees.push({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            department: department ? department.trim() : "",
          });
        } else {
          console.warn(`Skipping invalid line ${i}:`, parts);
        }
      }

      console.log("Parsed employees:", employees);

      if (employees.length === 0) {
        throw new Error("No valid employees found in CSV. Expected format: firstName,lastName,email,department");
      }

      const response = await fetch("/api/employees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employees,
          userId: user.id,
        }),
      });

      const data = await response.json();
      console.log("Bulk import response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to import employees");
      }

      setSuccess(`Successfully imported ${employees.length} employees!`);
      fetchEmployees();
      e.target.value = "";
    } catch (err: any) {
      console.error("CSV import error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      setSuccess("Employee deleted successfully!");
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          👥 Manage Employees
        </h1>
        <p className="text-black/70">
          Add employees individually or import from CSV file
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Add Single Employee */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Add Single Employee
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Department (Optional)
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#620089] text-white px-6 py-2 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </form>
      </div>

      {/* CSV Upload */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Import from CSV
        </h2>
        <p className="text-black/70 mb-4 text-sm">
          Upload a CSV file with columns: <strong>firstName,lastName,email,department</strong>
        </p>
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-black mb-2">Example CSV format:</p>
          <pre className="text-xs text-black/70 bg-gray-50 p-2 rounded">
{`firstName,lastName,email,department
John,Doe,john@example.com,IT
Jane,Smith,jane@example.com,HR`}
          </pre>
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={loading}
          className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#620089] file:text-white hover:file:bg-[#4a0068] disabled:opacity-50"
        />
      </div>

      {/* Employee List */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Employee List ({employees.length})
        </h2>
        {employees.length === 0 ? (
          <p className="text-black/70">No employees added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-black font-semibold">
                    Added
                  </th>
                  <th className="text-right py-3 px-4 text-black font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-black/5 hover:bg-white/50"
                  >
                    <td className="py-3 px-4 text-black">
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className="py-3 px-4 text-black">{employee.email}</td>
                    <td className="py-3 px-4 text-black/70">
                      {employee.department || "-"}
                    </td>
                    <td className="py-3 px-4 text-black/70 text-sm">
                      {formatDate(employee.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}