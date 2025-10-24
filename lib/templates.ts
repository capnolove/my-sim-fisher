export type CampaignTemplate = {
  id: string;
  name: string;
  category: "security" | "hr" | "it" | "general";
  description?: string;
  subject: string;
  body: string;
  variables: string[];
  tags?: string[];
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
};

export function extractVariables(text: string): string[] {
  const re = /{{\s*([\w.]+)\s*}}/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.add(m[1]);
  return Array.from(out);
}

export function formatDateToDDMMYYYY(dateString: string): string {
  if (!dateString) return dateString;
  
  try {
    // Parse the date string (handles YYYY-MM-DD format)
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    
    // Fallback: try Date parsing
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  } catch {
    return dateString;
  }
}

export function renderPreview(
  subject: string,
  body: string,
  data: Record<string, string>
): { subject: string; body: string } {
  let renderedSubject = subject;
  let renderedBody = body;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    renderedSubject = renderedSubject.replace(regex, value || `{{${key}}}`);
    renderedBody = renderedBody.replace(regex, value || `{{${key}}}`);
  });

  return {
    subject: renderedSubject,
    body: renderedBody,
  };
}

export const defaultTemplates: CampaignTemplate[] = [
  {
    id: "security-training-reminder",
    name: "Security Training Reminder",
    category: "security",
    description: "Reminder to complete security awareness training.",
    subject: "Reminder: Complete your security training by {{dueDate}}",
    body:
      "Hi {{firstName}},\n\nThis is a reminder to complete your security awareness training by {{dueDate}}.\nAccess your training here: {{actionLink}}\n\nThanks,\n{{companyName}}",
    variables: ["firstName", "dueDate", "actionLink", "companyName"],
    tags: ["reminder", "training"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "policy-update",
    name: "Policy Update Acknowledgment",
    category: "hr",
    description: "Notify employees about a policy update and request acknowledgment.",
    subject: "Action required: Review updated policy by {{dueDate}}",
    body:
      "Dear {{firstName}} {{lastName}},\n\nPlease review the updated {{policyName}} and acknowledge by {{dueDate}}.\nRead the policy: {{actionLink}}\n\nRegards,\nHR at {{companyName}}",
    variables: ["firstName", "lastName", "policyName", "dueDate", "actionLink", "companyName"],
    tags: ["policy", "acknowledgment"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "maintenance-window",
    name: "System Maintenance Notification",
    category: "it",
    description: "Notify users of a scheduled maintenance window.",
    subject: "Scheduled maintenance: {{windowStart}}–{{windowEnd}}",
    body:
      "Hello {{firstName}},\n\nWe will perform system maintenance from {{windowStart}} to {{windowEnd}}.\nDuring this window, access may be limited. Status page: {{statusLink}}\n\nIT Team, {{companyName}}",
    variables: ["firstName", "windowStart", "windowEnd", "statusLink", "companyName"],
    tags: ["maintenance", "it"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];