import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
    console.log("Login route hit");
    
    try {
        const body = await request.json();
        console.log("Request body:", body);
        
        const { email, password } = body;

        if (!email || !password) {
            console.log("Missing fields");
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        console.log("Finding user...");
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log("User not found");
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        console.log("Verifying password...");
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            console.log("Invalid password");
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        console.log("Login successful");
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            { 
                message: "Login successful",
                user: userWithoutPassword
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}