import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute
const ADMIN_MAX_REQUESTS = 20; // Stricter for admin logins

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Admin Route Protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminSession = req.cookies.get("admin_session");
    if (!adminSession) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. API Rate Limiting, CSRF, & Security Headers
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";

    // --- CSRF PROTECTION ---
    const method = req.method;
    const mutationMethods = ["POST", "PATCH", "DELETE", "PUT"];

    if (
      mutationMethods.includes(method) &&
      process.env.NODE_ENV === "production" &&
      !pathname.includes("/api/cron")
    ) {
      const origin = req.headers.get("origin");
      const referer = req.headers.get("referer");
      const host = req.headers.get("host");

      const allowedOrigins = [
        `https://${host}`,
        "https://ursulinestudycentre.com",
        "https://www.ursulinestudycentre.com",
      ];

      if (origin && !allowedOrigins.some((ao) => origin.startsWith(ao))) {
        return new NextResponse(
          JSON.stringify({ error: "Security violation: Cross-site request blocked." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      if (
        !origin &&
        referer &&
        !allowedOrigins.some((ao) => referer.startsWith(ao))
      ) {
        return new NextResponse(
          JSON.stringify({ error: "Security violation: Unauthorized referer." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    // --- END CSRF PROTECTION ---

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
      return new NextResponse("Too many requests, please try again later.", {
        status: 429,
      });
    }

    const res = NextResponse.next();
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-XSS-Protection", "1; mode=block");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
