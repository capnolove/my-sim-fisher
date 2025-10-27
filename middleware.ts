import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const loginAttempts = new Map<string, { count: number; timestamp: number }>();
const windowMs = 15 * 60 * 1000; // 15 minutes
const maxAttempts = 5;

function cleanupExpiredAttempts() {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.timestamp > windowMs) {
      loginAttempts.delete(ip);
    }
  }
}

export function middleware(request: NextRequest) {
  // Skip middleware for successful authentication response
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/auth/login')) {
    return NextResponse.next();
  }

  // Only apply rate limiting to login attempts
  if (request.nextUrl.pathname.startsWith('/api/auth/login')) {
    const ip = request.ip || 'anonymous';
    const now = Date.now();
    const attempts = loginAttempts.get(ip);

    cleanupExpiredAttempts();

    // If locked out
    if (attempts && attempts.count >= maxAttempts && now - attempts.timestamp < windowMs) {
      const timeLeft = Math.ceil((windowMs - (now - attempts.timestamp)) / 1000);
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${Math.ceil(timeLeft / 60)} minutes.` },
        { status: 429 }
      );
    }

    // Track attempt
    if (!attempts || now - attempts.timestamp > windowMs) {
      loginAttempts.set(ip, { count: 1, timestamp: now });
    } else {
      attempts.count++;
      loginAttempts.set(ip, attempts);
    }
  }

  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/api/auth/login',
    '/dashboard/:path*',
    '/phishing-pages/:path*'
  ]
};