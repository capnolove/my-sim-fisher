import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST (allow sent/clicked/submitted)
export async function POST(request: Request) {
  const { campaignId, employeeId, platform, action, timestamp, data } = await request.json();
  if (!["sent", "clicked", "submitted"].includes(action)) {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  }
  const log = await prisma.phishingLog.create({
    data: {
      campaignId,
      employeeId,
      platform,
      action,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      data,
    },
  });
  return NextResponse.json({ success: true, log });
}

// GET (include employeeDepartment when includeEmployee=1)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeEmployee = url.searchParams.get("includeEmployee") === "1";

  const logs = await prisma.phishingLog.findMany({ orderBy: { createdAt: "desc" } });
  if (!includeEmployee) return NextResponse.json({ success: true, logs });

  const employeeIds = Array.from(new Set(logs.map((l) => l.employeeId)));
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, firstName: true, lastName: true, email: true, department: true },
  });
  const empMap = new Map(employees.map((e) => [e.id, e]));

  const logsWithEmployee = logs.map((l) => {
    const e = empMap.get(l.employeeId);
    return {
      ...l,
      employeeName: e ? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() : undefined,
      employeeEmail: e?.email,
      employeeDepartment: e?.department || "Unknown",
    };
  });

  return NextResponse.json({ success: true, logs: logsWithEmployee });
}