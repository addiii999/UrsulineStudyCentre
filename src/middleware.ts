import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute
const ADMIN_MAX_REQUESTS = 20; // Stricter for admin logins

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Auth Protection (from proxy.ts)
  if (pathname.startsWith("/admin")) {
    const adminSession = req.cookies.get("admin_session");
    if (!adminSession) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/student")) {
    const studentSession = req.cookies.get("student_session");
    if (!studentSession) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. API Rate Limiting & Security Headers
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown-ip";
    const now = Date.now();
    
    let userRate = rateLimitMap.get(ip);
    if (!userRate || now - userRate.lastReset > RATE_LIMIT_WINDOW) {
      userRate = { count: 1, lastReset: now };
      rateLimitMap.set(ip, userRate);
    } else {
      userRate.count++;
    }

    const isAuthRoute = pathname.startsWith("/api/admin/login");
    const maxLimit = isAuthRoute ? ADMIN_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;

    if (userRate.count > maxLimit) {
      console.warn(`[Security] Rate limit exceeded for IP: ${ip} on route: ${pathname}`);
      return new NextResponse("Too many requests, please try again later.", { status: 429 });
    }

    const res = NextResponse.next();
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Content-Security-Policy", "default-src 'self'");
    res.headers.set("X-XSS-Protection", "1; mode=block");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/student/:path*"],
};
