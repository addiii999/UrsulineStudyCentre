import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export interface StudentSession {
  id: string;
  email: string;
  phone: string;
  role: "student";
}

/**
 * Server-side: Checks if the incoming request has a valid student session JWT.
 * Supports both old phone-based sessions (backward compat) and new email-based.
 */
export async function verifyStudentAuth(req: NextRequest): Promise<StudentSession | null> {
  const cookie = req.cookies.get("student_session");
  const token = cookie?.value;

  if (!token || token === "true") {
    return null;
  }

  try {
    const secretStr = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretStr) return null;

    const secret = new TextEncoder().encode(secretStr);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "student" || !payload.id) {
      return null;
    }

    return {
      id: payload.id as string,
      email: (payload.email as string) || "",
      phone: (payload.phone as string) || "",
      role: "student",
    };
  } catch {
    return null;
  }
}
