"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CampaignTemplate,
  defaultTemplates as libDefaults,
  extractVariables,
  renderPreview,
  formatDateToDDMMYYYY,
} from "@/lib/templates";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
};

const STORAGE_KEY_TEMPLATES = "msf.templates.v1";
const STORAGE_KEY_DRAFTS = "msf.campaignDrafts.v1";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false); // Add this state
  const router = useRouter();

  // Add phishing platform state
  const [phishingPlatform, setPhishingPlatform] = useState<string>("google");
  const [generatedLinks, setGeneratedLinks] = useState<any[]>([]);
  const [linkText, setLinkText] = useState<string>("Click here to verify your account");

  // Campaign variable data
  const [campaignData, setCampaignData] = useState({
    companyName: "MySimFisher",
    dueDate: "",
    actionLink: "",
    policyName: "",
    windowStart: "",
    windowEnd: "",
    statusLink: "",
  });

  // Load user and fetch employees
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchEmployees(parsedUser.id);
  }, [router]);

  // Fetch employees from API
  const fetchEmployees = async (userId: string) => {
    try {
      const response = await fetch(`/api/employees?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY_TEMPLATES) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CampaignTemplate[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplates(parsed);
          return;
        }
      }
    } catch {}
    setTemplates(libDefaults);
  }, []);

  const [templateId, setTemplateId] = useState<string>("");
  useEffect(() => {
    if (templates.length && !templateId) setTemplateId(templates[0].id);
  }, [templates, templateId]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templateId, templates]
  );

  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");

  useEffect(() => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject || "");
      setBody(selectedTemplate.body || "");
    }
  }, [selectedTemplate?.id]); 

  const detectedVars = useMemo(() => {
    const set = new Set<string>([...extractVariables(subject), ...extractVariables(body)]);
    return Array.from(set).sort();
  }, [subject, body]);

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [extraEmails, setExtraEmails] = useState<string>("");

  const departments = useMemo(() => {
    const d = new Set<string>();
    employees.forEach((e) => e.department && d.add(e.department));
    return Array.from(d).sort();
  }, [employees]);

  function toggleDepartment(dep: string) {
    setSelectedDepartments((prev) =>
      prev.includes(dep) ? prev.filter((d) => d !== dep) : [...prev, dep]
    );
  }

  function toggleEmployee(employeeId: string) {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  }

  function selectAll() {
    setSelectedEmployeeIds(employees.map((e) => e.id));
  }

  function deselectAll() {
    setSelectedEmployeeIds([]);
  }

  function onSelectEmployees(e: React.ChangeEvent<HTMLSelectElement>) {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedEmployeeIds(values);
  }

  const deptEmployeeIds = useMemo(() => {
    if (!selectedDepartments.length) return [];
    return employees
      .filter((e) => e.department && selectedDepartments.includes(e.department))
      .map((e) => e.id);
  }, [employees, selectedDepartments]);

  const allSelectedEmployeeIds = useMemo(() => {
    const set = new Set<string>([...selectedEmployeeIds, ...deptEmployeeIds]);
    return Array.from(set);
  }, [selectedEmployeeIds, deptEmployeeIds]);

  function parseExtraEmails(input: string): string[] {
    return input
      .split(/[\n,;, ]/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Function to replace {{LINK}} with actual phishing links
  function replaceLinksInBody(bodyText: string, employeeId: string, campaignId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${baseUrl}/phishing-pages/fake-login-pages/${phishingPlatform}?c=${campaignId}&e=${employeeId}`;
    
    // Create proper HTML link with the custom link text
    const linkHtml = `<a href="${link}" style="color: #0066cc; text-decoration: underline;">${linkText}</a>`;
    
    // Replace {{LINK}} with the clickable link
    let result = bodyText.replace(/\{\{LINK\}\}/g, linkHtml);
    
    // Convert line breaks to HTML <br> tags
    result = result.replace(/\n/g, '<br>');
    
    return result;
  }

  const preview = useMemo(() => {
    const campaignId = `campaign-${Date.now()}`;
    const previewData = {
      ...campaignData,
      dueDate: campaignData.dueDate ? formatDateToDDMMYYYY(campaignData.dueDate) : "",
      firstName: "Alex",
      lastName: "Nguyen",
      email: "alex.nguyen@example.com",
    };
    
    const rendered = renderPreview(subject, body, previewData);
    
    // Replace {{LINK}} with clickable link in preview
    const bodyWithLink = replaceLinksInBody(rendered.body, "preview-employee", `campaign-${Date.now()}`);
    
    return {
      subject: rendered.subject,
      body: bodyWithLink,
    };
  }, [subject, body, campaignData, phishingPlatform, linkText]);

  const sendEmailToEmployee = async (employeeId: string, employeeName: string, employeeEmail: string) => {
    const campaignId = `campaign-${Date.now()}`;
    
    const employeeData = {
      ...campaignData,
      dueDate: campaignData.dueDate ? formatDateToDDMMYYYY(campaignData.dueDate) : "",
      firstName: employeeName.split(' ')[0],
      lastName: employeeName.split(' ').slice(1).join(' '),
      email: employeeEmail,
    };
    
    const rendered = renderPreview(subject, body, employeeData);
    const bodyWithLink = replaceLinksInBody(rendered.body, employeeId, campaignId);
    
    // Wrap in proper HTML structure
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${bodyWithLink}
      </body>
      </html>
    `;

    try {
      setLoading(true);
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: employeeEmail,
          subject: rendered.subject,
          html: htmlBody,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Email sent successfully to ${employeeName}!\n\nMessage ID: ${data.messageId}`);
      } else {
        alert(`❌ Failed to send email to ${employeeName}\n\nError: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Failed to send email. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Fix: Combined send campaign function
  const handleSendCampaign = async () => {
    if (selectedEmployeeIds.length === 0) {
      alert("Please select at least one employee");
      return;
    }
    if (!phishingPlatform) {
      alert("Please select a phishing platform");
      return;
    }

    if (!confirm(`Send phishing campaign to ${selectedEmployeeIds.length} employees?`)) {
      return;
    }

    try {
      setSending(true);

      // Generate unique campaign ID
      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare recipients
      const recipients = selectedEmployees.map((emp) => ({
        employeeId: emp.id,
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
      }));

      let successCount = 0;
      let failCount = 0;
      const failedEmails: string[] = [];

      // Send emails one by one
      for (const recipient of recipients) {
        const employeeData = {
          ...campaignData,
          dueDate: campaignData.dueDate ? formatDateToDDMMYYYY(campaignData.dueDate) : "",
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
        };

        const rendered = renderPreview(subject, body, employeeData);
        const bodyWithLink = replaceLinksInBody(rendered.body, recipient.employeeId, campaignId);

        const htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${bodyWithLink}
          </body>
          </html>
        `;

        try {
          // Send email
          const emailResponse = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: recipient.email,
              subject: rendered.subject,
              html: htmlBody,
              companyName: campaignData.companyName,
            }),
          });

          const emailData = await emailResponse.json();

          if (emailData.success) {
            // Log "sent" action
            await fetch("/api/phishing/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                campaignId,
                employeeId: recipient.employeeId,
                platform: phishingPlatform,
                action: "sent",
                timestamp: new Date().toISOString(),
              }),
            });

            successCount++;
            console.log(`✅ Sent to ${recipient.email}`);
          } else {
            failCount++;
            failedEmails.push(recipient.email);
            console.error(`❌ Failed to send to ${recipient.email}:`, emailData.error);
          }

          // Add delay to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          failCount++;
          failedEmails.push(recipient.email);
        }
      }

      let message = `✅ Campaign completed!\n\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`;
      if (failedEmails.length > 0) {
        message += `\n\nFailed emails:\n${failedEmails.join("\n")}`;
      }
      alert(message);

      // Reset form on success
      if (successCount > 0) {
        setSelectedEmployeeIds([]);
      }
    } catch (error: any) {
      console.error("Send error:", error);
      alert("❌ " + (error.message || "Failed to send campaign"));
    } finally {
      setSending(false);
    }
  };

  const selectedEmployees = useMemo(() => {
    return employees.filter((e) => selectedEmployeeIds.includes(e.id));
  }, [employees, selectedEmployeeIds]);

  // Add the missing handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save campaign draft to localStorage
    const draft = {
      id: `draft-${Date.now()}`,
      templateId,
      subject,
      body,
      campaignData,
      phishingPlatform,
      linkText,
      selectedEmployeeIds,
      selectedDepartments,
      extraEmails,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingDrafts = localStorage.getItem(STORAGE_KEY_DRAFTS);
      const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];
      drafts.push(draft);
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
      
      alert("✅ Campaign draft saved successfully!");
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("❌ Failed to save campaign draft");
    }
  };

  if (!user || loading) {
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
        <h1 className="text-3xl font-bold text-black mb-2">📧 Create Campaign</h1>
        <p className="text-black/70">
          Choose a template, customize content, and select your target audience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column - Template & Content */}
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="template" className="block font-semibold text-black">
                Template
              </label>
              <Link
                href="/dashboard/templates"
                className="text-sm text-[#620089] hover:underline font-semibold"
              >
                Edit Templates →
              </Link>
            </div>
            <select
              id="template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.category ? `(${t.category})` : ""}
                </option>
              ))}
            </select>
            {selectedTemplate?.description && (
              <div className="mt-2 text-sm text-black/70">{selectedTemplate.description}</div>
            )}
          </div>

          {/* Phishing Platform Selection */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <div className="font-semibold text-black mb-3">🎯 Phishing Platform</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["google", "microsoft", "paypal", "hsbc", "citibank"].map((platform) => (
                <label
                  key={platform}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    phishingPlatform === platform
                      ? "border-[#620089] bg-white shadow-md"
                      : "border-gray-300 bg-white hover:border-[#620089]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={phishingPlatform === platform}
                    onChange={(e) => setPhishingPlatform(e.target.value)}
                    className="sr-only"
                  />
                  <img
                    src={`/${platform}.png`}
                    alt={platform}
                    className="h-6 w-auto"
                  />
                  <span className="text-sm font-medium text-black capitalize">
                    {platform}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom Link Text Input */}
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300">
              <label className="block text-sm font-semibold text-black mb-2">
                🔗 Clickable Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g., Click here to verify your account"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
              />
              <p className="mt-2 text-xs text-gray-600">
                💡 This text will appear as a clickable link when you use <code className="bg-gray-100 px-1 rounded text-blue-600">{'{{LINK}}'}</code> in your email body
              </p>
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Preview:</strong> <a href="#" className="text-blue-600 underline" onClick={(e) => e.preventDefault()}>{linkText}</a>
                </p>
              </div>
            </div>

            {/* Preview Link */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <a
                href={`/phishing-pages/fake-login-pages/${phishingPlatform}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                👁️ Preview {phishingPlatform.charAt(0).toUpperCase() + phishingPlatform.slice(1)} Template
              </a>
            </div>
          </div>

          {/* Subject */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <label htmlFor="subject" className="block font-semibold text-black mb-3">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089]"
              required
            />
          </div>

          {/* Body */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <label htmlFor="body" className="block font-semibold text-black mb-3">
              Body (use {'{{LINK}}'} for phishing link)
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body content - use {{LINK}} where you want the phishing link"
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#620089] text-sm"
              required
            />
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Use {'{{LINK}}'} in your email body where you want the phishing link to appear.
              </p>
            </div>
          </div>

          {/* Campaign Variables */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <div className="font-semibold text-black mb-3">📝 Campaign Variables</div>
            <div className="text-xs text-black/60 mb-4 italic">
              Fill in these values to replace variables in your template
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={campaignData.companyName}
                  onChange={(e) => setCampaignData({ ...campaignData, companyName: e.target.value })}
                  placeholder="MySimFisher"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={campaignData.dueDate}
                  onChange={(e) => setCampaignData({ ...campaignData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Action Link (will be replaced with phishing link)
                </label>
                <input
                  type="text"
                  value={campaignData.actionLink}
                  onChange={(e) => setCampaignData({ ...campaignData, actionLink: e.target.value })}
                  placeholder="Use {{LINK}} in your email body"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={campaignData.policyName}
                  onChange={(e) => setCampaignData({ ...campaignData, policyName: e.target.value })}
                  placeholder="e.g., Security Policy Update"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Window Start Date
                </label>
                <input
                  type="date"
                  value={campaignData.windowStart}
                  onChange={(e) => setCampaignData({ ...campaignData, windowStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Window End Date
                </label>
                <input
                  type="date"
                  value={campaignData.windowEnd}
                  onChange={(e) => setCampaignData({ ...campaignData, windowEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <div className="font-semibold text-black mb-3">📄 Live Preview</div>
            <div className="text-xs text-black/60 mb-3 italic">
              Preview shows how the email will look with your campaign data and clickable link
            </div>
            <div className="mb-3">
              <strong className="text-black">Subject:</strong>
              <div className="mt-1 text-black/80">{preview.subject}</div>
            </div>
            <div>
              <strong className="text-black">Body:</strong>
              <div 
                className="mt-1 whitespace-pre-wrap bg-white border border-gray-200 rounded-lg p-4 text-sm text-black"
                dangerouslySetInnerHTML={{ __html: preview.body }}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Target Selection */}
        <aside className="space-y-6">
          {/* Department Filter */}
          

          {/* Employee Selection */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-black">
                Select Employees ({selectedEmployeeIds.length}/{employees.length})
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[#620089] hover:underline"
                >
                  All
                </button>
                <span className="text-black/30">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[#620089] hover:underline"
                >
                  None
                </button>
              </div>
            </div>
            {employees.length === 0 ? (
              <div className="text-black/70 text-sm">
                No employees found.{" "}
                <a href="/dashboard/employees" className="text-[#620089] underline">
                  Add employees
                </a>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {employees.map((e) => (
                  <div key={e.id} className="border border-gray-300 rounded-lg bg-white">
                    <label className="flex items-center p-3 cursor-pointer hover:bg-white/50">
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(e.id)}
                        onChange={() => toggleEmployee(e.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-black">
                          {e.firstName} {e.lastName}
                        </p>
                        <p className="text-sm text-black/60">{e.email}</p>
                        {e.department && (
                          <p className="text-xs text-black/50">{e.department}</p>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extra Emails */}
          <div className="bg-[#D8AAEA] rounded-2xl shadow-lg p-6">
            <div className="font-semibold text-black mb-3">Add Extra Emails</div>
            <textarea
              value={extraEmails}
              onChange={(e) => setExtraEmails(e.target.value)}
              placeholder="Paste emails separated by comma, space, or new lines"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#620089]"
            />
          </div>

          {/* Send Campaign Button - FIXED */}
          {selectedEmployeeIds.length > 0 && (
            <button
              type="button"
              onClick={handleSendCampaign}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sending}
            >
              {sending
                ? `⏳ Sending... (${selectedEmployeeIds.length})`
                : `📧 Send Campaign (${selectedEmployeeIds.length})`}
            </button>
          )}

        </aside>
      </form>
    </div>
  );
}