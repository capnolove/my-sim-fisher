import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all employees for logged-in user
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const employees = await prisma.employee.findMany({
      where: { adminId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        createdAt: true, // Add this line to include createdAt
      },
      orderBy: [{ department: "asc" }, { lastName: "asc" }],
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Fetch employees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST single employee
export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, department, userId } = await request.json();

    if (!firstName || !lastName || !email || !userId) {
      return NextResponse.json(
        { error: "First name, last name, email, and user ID are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        department: department || null,
        adminId: userId,
      },
    });

    return NextResponse.json(
      { message: "Employee added", employee },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add employee error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add employee" },
      { status: 500 }
    );
  }
}