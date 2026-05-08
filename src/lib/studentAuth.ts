import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export interface StudentSession {
  id: string;
  phone: string;
  role: "student";
}

/**
 * Server-side: Checks if the incoming request has a valid student session JWT.
 */
export async function verifyStudentAuth(req: NextRequest): Promise<StudentSession | null> {
  const cookie = req.cookies.get("student_session");
  const token = cookie?.value;

  if (!token || token === "true") { // "true" was the old insecure cookie
    return null;
  }

  try {
    const secretStr = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretStr) return null;
    
    const secret = new TextEncoder().encode(secretStr);
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== "student" || !payload.id || !payload.phone) {
      return null;
    }

    return payload as unknown as StudentSession;
  } catch (err) {
    // Token invalid or expired
    return null;
  }
}
