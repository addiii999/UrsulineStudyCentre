import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { createAdminClient } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const adminClient = createAdminClient();

  try {
    const { username, password } = await req.json();

    // 1. Brute Force Protection: Check recent failed attempts
    const { data: recentAttempts, error: checkError } = await adminClient
      .from("login_attempts")
      .select("id")
      .eq("ip_address", ip)
      .eq("is_success", false)
      .gt("created_at", new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString());

    if (recentAttempts && recentAttempts.length >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again after 15 minutes." },
        { status: 429 }
      );
    }

    // 2. Validate inputs
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const storedUsername = process.env.ADMIN_USERNAME;
    const storedHash = process.env.ADMIN_PASSWORD_HASH;

    if (!storedUsername || !storedHash) {
      console.error("Admin credentials not configured.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // 3. Compare credentials
    const usernameMatch = username.trim().toLowerCase() === storedUsername.toLowerCase();
    const passwordMatch = usernameMatch ? await bcrypt.compare(password, storedHash) : false;

    // Record attempt
    await adminClient.from("login_attempts").insert({
      ip_address: ip,
      username: username.slice(0, 50),
      is_success: passwordMatch
    });

    if (!passwordMatch) {
      // Simulate delay to prevent timing attacks
      await new Promise(r => setTimeout(r, 500));
      logAudit({ action: "failed_login", table_name: "admin", item_label: `IP: ${ip}`, ip_address: ip }).catch(() => {});
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Generate JWT (Shortened expiry: 2 hours)
    const secretStr = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretStr) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const secret = new TextEncoder().encode(secretStr);
    const token = await new SignJWT({ role: "admin", username: storedUsername, ip })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .sign(secret);

    // 5. Set secure HttpOnly session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });

    logAudit({ action: "login", table_name: "admin", item_label: "Admin Login Success", ip_address: ip }).catch(() => {});
    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
