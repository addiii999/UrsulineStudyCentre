import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch student record by email
    const { data: student, error: fetchErr } = await adminClient
      .from("students")
      .select("id, otp_code, otp_expires_at, otp_attempts, email_verified")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (fetchErr || !student) {
      return NextResponse.json({ error: "No registration found for this email" }, { status: 404 });
    }

    if (student.email_verified) {
      return NextResponse.json({ success: true, already_verified: true });
    }

    // Check attempt count (max 5)
    if ((student.otp_attempts || 0) >= 5) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Check expiry
    if (!student.otp_expires_at || new Date(student.otp_expires_at) < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 410 });
    }

    // Verify OTP
    if (student.otp_code !== String(otp).trim()) {
      // Increment attempt count
      await adminClient
        .from("students")
        .update({ otp_attempts: (student.otp_attempts || 0) + 1 })
        .eq("id", student.id);
      return NextResponse.json({ error: "Incorrect OTP. Please check and try again." }, { status: 401 });
    }

    // ✅ OTP is correct — mark email as verified, clear OTP
    await adminClient
      .from("students")
      .update({
        email_verified: true,
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0,
      })
      .eq("id", student.id);

    return NextResponse.json({ success: true, student_id: student.id });
  } catch (err: unknown) {
    console.error("Verify OTP error:", err);
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
