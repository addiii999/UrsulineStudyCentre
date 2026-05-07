import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Dashboard
  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin_session");
    
    if (!adminSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Student Dashboard
  if (pathname.startsWith("/student")) {
    const studentSession = request.cookies.get("student_session");
    
    if (!studentSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
