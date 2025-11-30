import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

// In-memory store for failed login attempts
// In production, use Redis instead
const failedAttempts = new Map<string, { count: number; timestamp: number }>();

const MAX_ATTEMPTS = 5; // Max failed attempts
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isLockedOut(identifier: string): boolean {
  const attempt = failedAttempts.get(identifier);
  if (!attempt) return false;

  const now = Date.now();
  const timeSinceLastAttempt = now - attempt.timestamp;

  // If lockout period has passed, reset
  if (timeSinceLastAttempt > LOCKOUT_TIME) {
    failedAttempts.delete(identifier);
    return false;
  }

  // If still within lockout period and max attempts reached
  return attempt.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(identifier: string): void {
  const attempt = failedAttempts.get(identifier);
  const now = Date.now();

  if (!attempt) {
    failedAttempts.set(identifier, { count: 1, timestamp: now });
  } else {
    // Reset counter if lockout period has passed
    if (now - attempt.timestamp > LOCKOUT_TIME) {
      failedAttempts.set(identifier, { count: 1, timestamp: now });
    } else {
      attempt.count++;
      attempt.timestamp = now;
    }
  }
}

function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

function getRemainingLockoutTime(identifier: string): number {
  const attempt = failedAttempts.get(identifier);
  if (!attempt) return 0;

  const timeSinceLastAttempt = Date.now() - attempt.timestamp;
  const remaining = LOCKOUT_TIME - timeSinceLastAttempt;

  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export async function POST(request: Request) {
  try {
    // 1. Get client identifier (IP address or email)
    const clientIp = getClientIp(request);

    // 2. Validate request body
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const identifier = `${emailLower}:${clientIp}`; // Combine email + IP for better accuracy

    // 3. CHECK IF ACCOUNT IS LOCKED
    if (isLockedOut(identifier)) {
      const remainingTime = getRemainingLockoutTime(identifier);
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please try again in ${remainingTime} seconds.`,
          locked: true,
          remainingTime,
        },
        { status: 429 } // 429 = Too Many Requests
      );
    }

    // 4. Add delay to prevent timing attacks
    await new Promise(r => setTimeout(r, Math.random() * 500));

    // 5. Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    // 6. Check user exists and password matches
    if (!user || !(await compare(password, user.password))) {
      // ✅ RECORD FAILED ATTEMPT
      recordFailedAttempt(identifier);
      
      const attemptData = failedAttempts.get(identifier);
      const remainingAttempts = MAX_ATTEMPTS - (attemptData?.count || 0);

      return NextResponse.json(
        {
          error: 'Invalid credentials',
          attemptsRemaining: Math.max(remainingAttempts, 0),
        },
        { status: 401 }
      );
    }

    // 7. CLEAR FAILED ATTEMPTS ON SUCCESSFUL LOGIN
    clearFailedAttempts(identifier);

    // 8. Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // 9. Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

    // 10. Set secure cookie with token
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