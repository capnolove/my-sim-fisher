import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { campaignId, platform, recipients } = await request.json();

    if (!campaignId || !platform || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "campaignId, platform, and recipients required" },
        { status: 400 }
      );
    }

    const now = new Date();
    await prisma.$transaction(
      recipients.map((r: { employeeId: string; email: string }) =>
        prisma.phishingLog.create({
          data: {
            campaignId,
            employeeId: r.employeeId,
            platform,
            action: "sent",
            timestamp: now,
          },
        })
      )
    );

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