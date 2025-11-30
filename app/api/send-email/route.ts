import { NextRequest, NextResponse } from "next/server";
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, companyName } = await request.json();

    console.log("📧 Attempting to send email to:", to);
    console.log("📧 Subject:", subject);
    console.log("📧 From:", companyName);
    console.log("📧 Using domain:", process.env.MAILGUN_DOMAIN);

    const messageData = {
      from: `${companyName} <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: [to],
      subject: subject,
      html: html,
    };

    const result = await mg.messages.create(
      process.env.MAILGUN_DOMAIN || "",
      messageData
    );

    console.log("✅ Mailgun result:", result);

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      messageId: result.id 
    });
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error response:", error.response?.body);
    
    return NextResponse.json(
      { 
        error: "Failed to send email", 
        details: error.message || error.toString(),
        mailgunError: error.response?.body?.message || null
      },
      { status: 500 }
    );
  }
}