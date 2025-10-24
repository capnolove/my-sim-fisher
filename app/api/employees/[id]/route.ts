import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// DELETE employee by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log("Deleting employee:", id);

    await prisma.employee.delete({
      where: { id },
    });

    console.log("Employee deleted successfully");

    return NextResponse.json(
      { message: "Employee deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete employee error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete employee" },
      { status: 500 }
    );
  }
}