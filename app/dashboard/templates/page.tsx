"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CampaignTemplate,
  defaultTemplates,
  extractVariables,
  renderPreview,
  formatDateToDDMMYYYY, // Add this import
} from "@/lib/templates";

type EditorState = Omit<CampaignTemplate, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

const STORAGE_KEY = "msf.templates.v1";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CampaignTemplate[];
        setTemplates(parsed);
        return;
      } catch {}
    }
    setTemplates(defaultTemplates);
  }, []);

  useEffect(() => {
    if (templates.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  }, [templates]);

  const editing = useMemo(
    () => templates.find((t) => t.id === editingId) || null,
    [templates, editingId]
  );

  const [form, setForm] = useState<EditorState>({
    name: "",
    category: "general",
    description: "",
    subject: "",
    body: "",
    variables: [],
    tags: [],
    isActive: true,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        id: editing.id,
        name: editing.name,
        category: editing.category,
        description: editing.description,
        subject: editing.subject,
        body: editing.body,
        variables: editing.variables,
        tags: editing.tags ?? [],
        isActive: editing.isActive ?? true,
      });
    } else {
      setForm({
        name: "",
        category: "general",
        description: "",
        subject: "",
        body: "",
        variables: [],
        tags: [],
        isActive: true,
      });
    }
  }, [editingId, editing]);

  const derivedVars = useMemo(() => {
    const vars = new Set<string>(
      [...extractVariables(form.subject), ...extractVariables(form.body)]
    );
    return Array.from(vars).sort();
  }, [form.subject, form.body]);

  const sampleData = useMemo<Record<string, string>>(
    () => ({
      firstName: "Alex",
      lastName: "Nguyen",
      email: "alex.nguyen@example.com",
      companyName: "MySimFisher",
      dueDate: formatDateToDDMMYYYY("2025-11-15"), // Now formatted as DD/MM/YYYY
      actionLink: "https://example.com/action",
      policyName: "Acceptable Use Policy",
      windowStart: "Sat 10:00",
      windowEnd: "Sat 14:00",
      statusLink: "https://status.example.com",
    }),
    []
  );

  const preview = useMemo(
    () => renderPreview(form.subject, form.body, sampleData),
    [form.subject, form.body, sampleData]
  );

  function startNew() {
    setEditingId(null);
    setForm({
      name: "",
      category: "general",
      description: "",
      subject: "",
      body: "",
      variables: [],
      tags: [],
      isActive: true,
    });
  }

  function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    const data: CampaignTemplate = {
      id: form.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category as CampaignTemplate["category"],
      description: form.description?.trim(),
      subject: form.subject,
      body: form.body,
      variables: derivedVars,
      tags: form.tags ?? [],
      isActive: form.isActive ?? true,
      updatedAt: now,
      createdAt: editing?.createdAt ?? now,
    };

    if (!data.name || !data.subject || !data.body) {
      alert("Name, subject, and body are required.");
      return;
    }

    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === data.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = data;
        return copy;
      }
      return [data, ...prev];
    });
    setEditingId(data.id);
    alert("✅ Template saved successfully!");
  }

  function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) startNew();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          📝 Template Manager
        </h1>
        <p className="text-black/70">
          Create and edit reusable email templates with variables
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar - Template List */}
        <aside className="space-y-4">
          <button
            onClick={startNew}
            className="w-full bg-[#620089] text-white px-4 py-3 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
          >
            ✨ New Template
          </button>

          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            <h2 className="font-semibold text-black mb-3">
              Templates ({templates.length})
            </h2>
            {templates.length === 0 ? (
              <div className="text-black/60 text-sm">No templates yet</div>
            ) : (
              <ul className="space-y-2">
                {templates.map((t) => (
                  <li
                    key={t.id}
                    className={`border rounded-lg p-3 transition-colors ${
                      editingId === t.id
                        ? "bg-[#620089] border-[#620089]"
                        : "bg-white border-gray-300 hover:border-[#620089]"
                    }`}
                  >
                    <div
                      className={`font-semibold mb-1 ${
                        editingId === t.id ? "text-white" : "text-black"
                      }`}
                    >
                      {t.name}
                    </div>
                    <div
                      className={`text-xs mb-2 ${
                        editingId === t.id ? "text-white/80" : "text-black/60"
                      }`}
                    >
                      {t.category.toUpperCase()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(t.id)}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                          editingId === t.id
                            ? "bg-white text-[#620089]"
                            : "bg-[#620089] text-white hover:bg-[#4a0068]"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTemplate(t.id)}
                        className="px-3 py-1 rounded text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content - Editor */}
        <div className="space-y-6">
          <form onSubmit={saveTemplate} className="space-y-6">
            {/* Template Details */}
            <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-black mb-4">
                {editing ? "Edit Template" : "New Template"}
              </h2>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Template Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g., Security Training Reminder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
                  >
                    <option value="security">Security</option>
                    <option value="hr">HR</option>
                    <option value="it">IT</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Status
                  </label>
                  <div className="flex items-center h-10">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isActive: e.target.checked }))
                      }
                      className="w-4 h-4 text-[#620089] border-gray-300 rounded focus:ring-[#620089]"
                    />
                    <label className="ml-2 text-sm text-black">Active</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Description (optional)
                </label>
                <input
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Short description of this template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
                />
              </div>
            </div>

            {/* Email Content */}
            <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-black mb-4">
                Email Content
              </h2>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Subject Line *
                </label>
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  placeholder="e.g., Action Required"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Email Body *
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, body: e.target.value }))
                  }
                  placeholder="Write your email body here..."
                  rows={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089] font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Detected Variables
                </label>
                <div className="flex flex-wrap gap-2">
                    {derivedVars.length === 0 ? (
                    <span className="text-sm text-black/60">
                      No variables detected
                    </span>
                  ) : (
                    derivedVars.map((v) => (
                      <span
                        key={v}
                        className="bg-white border border-gray-300 px-3 py-1 rounded-lg text-sm text-black"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))
                  )
                  }   
                  </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#620089] text-white px-6 py-2.5 rounded-lg hover:bg-[#4a0068] transition-colors font-semibold"
              >
                💾 Save Template
              </button>
              <button
                type="button"
                onClick={startNew}
                className="bg-white border border-gray-300 text-black px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Clear Form
              </button>
            </div>
          </form>

          {/* Preview */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-black mb-4">
              📄 Live Preview
            </h2>
            <div className="text-xs text-black/60 mb-4 italic">
              Preview uses sample data to show how variables will be replaced
            </div>
            <div className="mb-4">
              <strong className="text-black">Subject:</strong>
              <div className="mt-1 text-black/80">{preview.subject}</div>
            </div>
            <div>
              <strong className="text-black">Body:</strong>
              <pre className="mt-2 whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-4 text-sm text-black">
                {preview.body}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Variables */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <div className="font-semibold text-black mb-3">📝 Available Variables</div>
        <div className="text-xs text-black/60 mb-4 italic">
          Use these variables in your subject and body. They will be replaced with actual values when creating a campaign.
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{companyName}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Your company name</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{firstName}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Employee's first name</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{lastName}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Employee's last name</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{email}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Employee's email address</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{dueDate}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Campaign due date (DD/MM/YYYY)</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{policyName}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Policy or document name</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{windowStart}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Window start date</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-300">
            <code className="text-sm font-mono text-blue-600">{'{{windowEnd}}'}</code>
            <p className="text-xs text-gray-600 mt-1">Window end date</p>
          </div>
          
          {/* ADD THIS - Phishing Link Variable */}
          <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-400">
            <code className="text-sm font-mono text-blue-600 font-bold">{'{{LINK}}'}</code>
            <p className="text-xs text-yellow-800 mt-1 font-semibold">
              ⚠️ Phishing link - Will be replaced with a clickable tracking link
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Use this where you want the phishing link to appear. The link text can be customized when creating the campaign.
            </p>
            <div className="mt-2 p-2 bg-white rounded border border-yellow-300">
              <p className="text-xs text-gray-700">
                <strong>Example usage:</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                "Please {'{{LINK}}'} to verify your account."
              </p>
              <p className="text-xs text-gray-600 mt-1 italic">
                Will become: "Please <span className="text-blue-600 underline">Click here to verify your account</span> to verify your account."
              </p>
            </div>
          </div>
        </div>

        {/* Add Example Section */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">💡 Template Example:</p>
          <div className="bg-white p-3 rounded border border-blue-300 text-xs space-y-2">
            <p className="font-mono text-gray-800">
              Dear {'{{firstName}}'} {'{{lastName}},'}
            </p>
            <p className="font-mono text-gray-800">
              We've detected unusual activity on your account at {'{{companyName}}'}.
            </p>
            <p className="font-mono text-gray-800">
              Please {'{{LINK}}'} before {'{{dueDate}}'} to secure your account.
            </p>
            <p className="font-mono text-gray-800 mt-3">
              Best regards,<br/>
              IT Security Team
            </p>
          </div>
        </div>
      </div>

      {/* Footer Tip */}
      <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
        <p className="text-sm text-black/70">
          💡 <strong>Tip:</strong> Keep templates professional and compliant.
          Available variables: firstName, lastName, email, companyName, dueDate,
          LINK, policyName, windowStart, windowEnd
        </p>
      </div>
    </div>
  );
}