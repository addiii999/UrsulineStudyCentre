import { NextRequest } from "next/server";

/**
 * Server-side: Checks if the incoming request has a valid admin session cookie.
 * Used in all protected API routes (PATCH, POST, DELETE).
 */
export function checkAdminAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_session");
  return cookie?.value === "true";
}
