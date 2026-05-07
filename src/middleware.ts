import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute
const ADMIN_MAX_REQUESTS = 20; // Stricter for admin logins

export function middleware(req: NextRequest) {
  // 1. Check for rate limiting based on IP
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown-ip";
  const now = Date.now();
  
  let userRate = rateLimitMap.get(ip);
  if (!userRate || now - userRate.lastReset > RATE_LIMIT_WINDOW) {
    userRate = { count: 1, lastReset: now };
    rateLimitMap.set(ip, userRate);
  } else {
    userRate.count++;
  }

  // Stricter rate limit for admin login route
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/admin/login");
  const maxLimit = isAuthRoute ? ADMIN_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;

  if (userRate.count > maxLimit) {
    console.warn(`[Security] Rate limit exceeded for IP: ${ip} on route: ${req.nextUrl.pathname}`);
    return new NextResponse("Too many requests, please try again later.", { status: 429 });
  }

  // 2. Add security headers for API responses
  const res = NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Content-Security-Policy", "default-src 'self'");
    res.headers.set("X-XSS-Protection", "1; mode=block");
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
