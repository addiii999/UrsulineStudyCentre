import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminClient = createAdminClient();

    // Look up pending registration
    const { data: pending, error: fetchErr } = await adminClient
      .from("pending_registrations")
      .select("id, otp_code, otp_expires_at, otp_attempts, verified")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchErr) {
      console.error("[verify-otp] DB error:", fetchErr);
      return NextResponse.json({ error: "Verification service error. Please try again." }, { status: 500 });
    }

    if (!pending) {
      return NextResponse.json(
        { error: "No pending registration found. Please go back and submit your form again." },
        { status: 404 }
      );
    }

    // Already verified — let them proceed
    if (pending.verified) {
      return NextResponse.json({ success: true, message: "Email already verified." });
    }

    // Check expiry FIRST
    if (!pending.otp_expires_at || new Date(pending.otp_expires_at) < new Date()) {
      await adminClient.from("pending_registrations").delete().eq("id", pending.id);
      return NextResponse.json(
        { error: "This OTP has expired. Please go back and request a new one." },
        { status: 410 }
      );
    }

    // Check attempt limit
    if ((pending.otp_attempts || 0) >= MAX_OTP_ATTEMPTS) {
      await adminClient.from("pending_registrations").delete().eq("id", pending.id);
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please go back and request a new OTP." },
        { status: 429 }
      );
    }

    // Compare OTP
    const submittedOtp = String(otp).trim();
    if (pending.otp_code !== submittedOtp) {
      // Increment attempt count
      await adminClient
        .from("pending_registrations")
        .update({ otp_attempts: (pending.otp_attempts || 0) + 1 })
        .eq("id", pending.id);

      const remaining = MAX_OTP_ATTEMPTS - (pending.otp_attempts || 0) - 1;
      return NextResponse.json(
        {
          error: remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Incorrect code. No attempts remaining. Please request a new OTP.",
        },
        { status: 401 }
      );
    }

    // ✅ OTP correct — mark as verified using the boolean column
    // This avoids any NOT NULL constraint issues on otp_code
    const { error: updateErr } = await adminClient
      .from("pending_registrations")
      .update({
        verified: true,
        otp_attempts: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pending.id);

    if (updateErr) {
      console.error("[verify-otp] Failed to mark as verified:", updateErr);
      return NextResponse.json({ error: "Verification failed to save. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email verified successfully." });

  } catch (err: unknown) {
    console.error("[verify-otp] Error:", err);
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
