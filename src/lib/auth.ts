import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Server-side: Checks if the incoming request has a valid admin session cookie.
 * Used in all protected API routes (PATCH, POST, DELETE).
 * Validates the JWT signature.
 */
export async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get("admin_session");
  const token = cookie?.value;

  if (!token) {
    const { logAudit } = await import("@/lib/audit");
    await logAudit({ action: "unauthorized_request", table_name: "auth", item_label: req.nextUrl.pathname }).catch(() => {});
    return false;
  }

  try {
    const secret = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) return false;
    
    const encodedSecret = new TextEncoder().encode(secret);
    await jwtVerify(token, encodedSecret);
    return true;
  } catch {
    const { logAudit } = await import("@/lib/audit");
    await logAudit({ action: "unauthorized_request", table_name: "auth", item_label: "Invalid JWT: " + req.nextUrl.pathname }).catch(() => {});
    return false;
  }
}

/**
 * Returns a descriptive error message for unauthorized responses.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Session expired or invalid. Please log in to the admin panel again." },
    { status: 401 }
  );
}


