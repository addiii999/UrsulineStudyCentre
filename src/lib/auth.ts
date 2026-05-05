import { NextRequest } from "next/server";

export function checkAdminAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_session");
  return cookie?.value === "true";
}
