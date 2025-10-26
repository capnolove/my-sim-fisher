import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Build date filter
    const dateFilter = startDate && endDate ? {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Get phishing logs with date filter
    const logs = await prisma.phishingLog.findMany({
      where: dateFilter,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
      }
    });

    // Calculate statistics
    const departmentStats = new Map();

    logs.forEach(log => {
      const dept = log.employee?.department || "Unknown";
      
      if (!departmentStats.has(dept)) {
        departmentStats.set(dept, {
          total: 0,
          clicked: 0,
          submitted: 0,
          employeeActions: new Map()
        });
      }

      const stats = departmentStats.get(dept);
      stats.total++;

      if (log.action === "clicked") stats.clicked++;
      if (log.action === "submitted") stats.submitted++;

      // Track employee actions for repeat offender calculation
      if (!stats.employeeActions.has(log.employeeId)) {
        stats.employeeActions.set(log.employeeId, []);
      }
      stats.employeeActions.get(log.employeeId).push({
        action: log.action,
        timestamp: log.timestamp
      });
    });

    // Convert to final format
    const analytics = Array.from(departmentStats.entries()).map(([dept, stats]) => {
      const repeatOffenders = calculateRepeatOffenders(stats.employeeActions);
      
      return {
        department: dept,
        metrics: {
          total: stats.total,
          clicked: stats.clicked,
          submitted: stats.submitted,
          clickRate: (stats.clicked / stats.total * 100).toFixed(1),
          submissionRate: (stats.submitted / stats.total * 100).toFixed(1),
          repeatOffenderRate: repeatOffenders.rate.toFixed(1),
          repeatOffenders: repeatOffenders.count
        }
      };
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}

function calculateRepeatOffenders(employeeActions: Map<string, any[]>) {
  let repeatCount = 0;
  let totalEligible = 0;

  employeeActions.forEach(actions => {
    if (actions.length < 2) return;
    totalEligible++;

    // Sort by timestamp and check for consecutive fails
    const sorted = actions.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let consecutiveFails = 0;
    for (const action of sorted) {
      if (action.action === "clicked" || action.action === "submitted") {
        consecutiveFails++;
        if (consecutiveFails >= 2) {
          repeatCount++;
          break;
        }
      } else {
        consecutiveFails = 0;
      }
    }
  });

  return {
    count: repeatCount,
    rate: totalEligible > 0 ? (repeatCount / totalEligible) * 100 : 0
  };
}