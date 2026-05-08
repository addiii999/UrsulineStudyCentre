import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CSRF Protection Middleware
 * 1. Checks Origin/Referer for all mutation requests (POST, PATCH, DELETE, PUT)
 * 2. Blocks requests from unknown origins in production
 */
export function middleware(request: NextRequest) {
  const { method, headers, nextUrl } = request;

  // 1. Only protect mutation methods
  const mutationMethods = ["POST", "PATCH", "DELETE", "PUT"];
  if (!mutationMethods.includes(method)) {
    return NextResponse.next();
  }

  // 2. Skip CSRF for internal next.js requests or specific public routes if needed
  if (nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes("/api/cron")) {
    return NextResponse.next();
  }

  // 3. Perform Origin Check
  const origin = headers.get("origin");
  const referer = headers.get("referer");
  const host = headers.get("host");

  // In production, we strictly validate the origin
  if (process.env.NODE_ENV === "production") {
    const allowedOrigins = [
      `https://${host}`, // Current host
      "https://ursulinestudycentre.com", // Main domain
      "https://www.ursulinestudycentre.com",
    ];

    if (origin && !allowedOrigins.some(ao => origin.startsWith(ao))) {
      console.warn(`[CSRF] Blocked request from unauthorized origin: ${origin}`);
      return new NextResponse(
        JSON.stringify({ error: "Security violation: Cross-site request blocked." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fallback to Referer check if Origin is missing (some browsers/clients)
    if (!origin && referer) {
      if (!allowedOrigins.some(ao => referer.startsWith(ao))) {
        console.warn(`[CSRF] Blocked request from unauthorized referer: ${referer}`);
        return new NextResponse(
          JSON.stringify({ error: "Security violation: Unauthorized referer." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // 4. Custom Header Check (Additional layer)
  // Most CSRF attacks happen via simple <a> tags or <form> submits which can't set custom headers.
  // We don't enforce this for now to avoid breaking existing frontend fetch calls, 
  // but it's a good future step.

  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: "/api/:path*",
};
