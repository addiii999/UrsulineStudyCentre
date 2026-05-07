import { NextRequest } from "next/server";

/**
 * Server-side: Checks if the incoming request has a valid admin session cookie.
 * Used in all protected API routes (PATCH, POST, DELETE).
 */
export function checkAdminAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_session");
  return cookie?.value === "true";
}

/**
 * Returns a descriptive error message for unauthorized responses.
 * Use this to give the admin a clear message instead of just "Unauthorized".
 */
export function unauthorizedResponse() {
  const { NextResponse } = require("next/server");
  return NextResponse.json(
    { error: "Session expired or not found. Please log in to the admin panel again." },
    { status: 401 }
  );
}
