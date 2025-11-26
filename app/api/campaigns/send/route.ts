import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { campaignId, platform, recipients } = await request.json();

    // Validate input
    if (!campaignId || !platform || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "campaignId, platform, and recipients required" },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        subject: true,
        senderEmail: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Log campaign as sent for all recipients
    const now = new Date();
    const logs = recipients.map((r: { employeeId: string; email: string }) => ({
      campaignId,
      employeeId: r.employeeId,
      platform,
      action: "sent" as const,
      timestamp: now,
    }));

    // Create all logs in one transaction
    await prisma.phishingLog.createMany({
      data: logs,
    });

    return NextResponse.json({
      success: true,
      sent: recipients.length,
      message: `Campaign sent to ${recipients.length} employees`,
    });
  } catch (err: any) {
    console.error("Send campaign error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to send campaign" },
      { status: 500 }
    );
  }
}