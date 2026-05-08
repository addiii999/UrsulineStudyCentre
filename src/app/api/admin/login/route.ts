import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 1. Validate inputs exist
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // 2. Compare username (case-insensitive)
    const storedUsername = process.env.ADMIN_USERNAME;
    const storedHash = process.env.ADMIN_PASSWORD_HASH;

    if (!storedUsername || !storedHash) {
      console.error("Admin credentials not configured in environment variables.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (username.trim().toLowerCase() !== storedUsername.toLowerCase()) {
      // Simulate timing delay to prevent user enumeration attacks
      await bcrypt.compare("dummy", "$2b$12$dummyhashfortimingnormalisation");
      logAudit({ action: "failed_login", table_name: "admin", item_label: "Invalid Username" });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Compare password securely using bcrypt
    const passwordMatch = await bcrypt.compare(password, storedHash);
    if (!passwordMatch) {
      logAudit({ action: "failed_login", table_name: "admin", item_label: "Invalid Password" });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Generate JWT
    const secretStr = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY; // Fallback to supabase secret if JWT secret missing
    if (!secretStr) {
      console.error("JWT_SECRET is missing.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const secret = new TextEncoder().encode(secretStr);
    const token = await new SignJWT({ role: "admin", username: storedUsername })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    // 5. Set secure HttpOnly session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,       // JS cannot read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",   // CSRF protection
      maxAge: 60 * 60 * 8,  // 8 hours session
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout — clear the cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });
  return response;
}
