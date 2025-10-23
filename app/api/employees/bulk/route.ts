import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST bulk employees
export async function POST(request: Request) {
  try {
    const { employees, userId } = await request.json();

    if (!employees || !Array.isArray(employees)) {
      return NextResponse.json(
        { error: "Invalid employee data" },
        { status: 400 }
      );
    }

    const created = await prisma.employee.createMany({
      data: employees.map((emp: any) => ({
        name: emp.name,
        email: emp.email,
        adminId: userId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: `Imported ${created.count} employees`, count: created.count },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to import employees" },
      { status: 500 }
    );
  }
}