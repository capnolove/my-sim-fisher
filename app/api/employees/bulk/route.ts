import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employees, userId } = body;

    console.log("Bulk import request:", { userId, employeeCount: employees?.length });

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!employees || !Array.isArray(employees)) {
      return NextResponse.json(
        { error: "Invalid employee data" },
        { status: 400 }
      );
    }

    if (employees.length === 0) {
      return NextResponse.json(
        { error: "No employees provided" },
        { status: 400 }
      );
    }

    // Validate each employee
    for (const emp of employees) {
      if (!emp.firstName || !emp.lastName || !emp.email) {
        return NextResponse.json(
          { error: "Each employee must have firstName, lastName, and email" },
          { status: 400 }
        );
      }
    }

    const created = await prisma.employee.createMany({
      data: employees.map((emp: any) => ({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department || null,
        adminId: userId,
      })),
      skipDuplicates: true,
    });

    console.log("Bulk import success:", created.count);

    return NextResponse.json(
      { message: `Imported ${created.count} employees`, count: created.count },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import employees" },
      { status: 500 }
    );
  }
}