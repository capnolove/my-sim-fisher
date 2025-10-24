import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, employeeId, platform, action, timestamp, data } = body;

    // Validate required fields
    if (!campaignId || !employeeId || !platform || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ["clicked", "submitted", "opened"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    // Log the phishing interaction
    const log = await prisma.phishingLog.create({
      data: {
        campaignId,
        employeeId,
        platform,
        action, // "clicked", "submitted", or "opened"
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        data: data || {}, // Store additional data (e.g., submitted credentials)
      },
    });

    console.log("✅ Phishing log created:", {
      id: log.id,
      campaignId,
      employeeId,
      action,
    });

    return NextResponse.json(
      { success: true, message: "Logged successfully", logId: log.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Phishing log error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log interaction" },
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint to retrieve logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const employeeId = searchParams.get("employeeId");
    const includeEmployee = searchParams.get("includeEmployee");

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (employeeId) where.employeeId = employeeId;

    const logs = await prisma.phishingLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    if (includeEmployee) {
      const employeeIds = Array.from(new Set(logs.map((l) => l.employeeId)));
      const employees = await prisma.employee.findMany({
        where: { id: { in: employeeIds } },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
      const empMap = new Map(employees.map((e) => [e.id, e]));

      const logsWithEmployee = logs.map((l) => {
        const e = empMap.get(l.employeeId);
        return {
          ...l,
          employeeName: e ? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() : undefined,
          employeeEmail: e?.email,
        };
      });

      return NextResponse.json({ success: true, logs: logsWithEmployee });
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve logs" },
      { status: 500 }
    );
  }
}