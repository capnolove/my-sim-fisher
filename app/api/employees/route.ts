import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all employees for logged-in user
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    const employees = await prisma.employee.findMany({
      where: { adminId: userId || "" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ employees }, { status: 200 });
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
    const { name, email, userId } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        adminId: userId,
      },
    });

    return NextResponse.json(
      { message: "Employee added", employee },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add employee error:", error);
    return NextResponse.json(
      { error: "Failed to add employee" },
      { status: 500 }
    );
  }
}