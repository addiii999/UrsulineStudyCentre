import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const MAX_ATTEMPTS = 6;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const adminClient = createAdminClient();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // ── Brute-force protection ──────────────────────────────
    const { data: recentFails } = await adminClient
      .from("login_attempts")
      .select("id")
      .eq("ip_address", ip)
      .eq("email", email.toLowerCase().trim())
      .eq("is_success", false)
      .gt("created_at", new Date(Date.now() - LOCKOUT_WINDOW_MS).toISOString());

    if (recentFails && recentFails.length >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // ── Fetch student record ────────────────────────────────
    const { data: student, error: fetchErr } = await adminClient
      .from("students")
      .select("id, full_name, email, present_phone, password_hash, email_verified, admission_status, approval_status, course, present_class, session")
      .eq("email", email.toLowerCase().trim())
      .eq("is_deleted", false)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    // Simulate delay to prevent timing attacks on non-existent accounts
    await new Promise(r => setTimeout(r, 400));

    const recordAttempt = async (success: boolean) => {
      try {
        await adminClient.from("login_attempts").insert({
          ip_address: ip,
          email: email.toLowerCase().trim(),
          is_success: success,
        });
      } catch { /* non-critical */ }
    };

    if (!student) {
      await recordAttempt(false);
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    // ── Email must be verified before login is allowed ──────
    if (!student.email_verified) {
      await recordAttempt(false);
      return NextResponse.json(
        { error: "Email not verified. Please complete the OTP verification first." },
        { status: 403 }
      );
    }

    // ── Admin approval required to login ───────────────────
    if (student.approval_status === "rejected") {
      await recordAttempt(false);
      return NextResponse.json(
        { error: "Your application was not approved. Please contact the admin office." },
        { status: 403 }
      );
    }

    if (student.approval_status === "pending") {
      await recordAttempt(false);
      return NextResponse.json(
        { error: "Your application is pending admin approval. You will be notified once approved." },
        { status: 403 }
      );
    }

    // ── Password verification ───────────────────────────────
    if (!student.password_hash) {
      await recordAttempt(false);
      return NextResponse.json(
        { error: "Account setup incomplete. Please contact the admin office." },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(password, student.password_hash);

    if (!passwordValid) {
      await recordAttempt(false);
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    // ── Authentication successful ───────────────────────────
    await recordAttempt(true);

    const secretStr = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretStr) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const secret = new TextEncoder().encode(secretStr);
    const token = await new SignJWT({
      role: "student",
      id: student.id,
      email: student.email,
      phone: student.present_phone,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    const res = NextResponse.json({
      success: true,
      student: { name: student.full_name },
    });

    res.cookies.set("student_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400,
      sameSite: "strict",
    });

    return res;
  } catch (err: unknown) {
    console.error("Student login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
