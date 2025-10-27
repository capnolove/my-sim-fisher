import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Validate request body
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // 3. Add delay to prevent timing attacks
    await new Promise(r => setTimeout(r, Math.random() * 500));

    // 4. Check user exists and password matches
    if (!user || !(await compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 5. Generate JWT token
    const token = sign(
      { 
        userId: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // 6. Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

    // 7. Set secure cookie with token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}