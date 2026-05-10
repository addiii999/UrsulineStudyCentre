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

    // ── Look up pending registration ──────────────────────────────
    const { data: pending, error: fetchErr } = await adminClient
      .from("pending_registrations")
      .select("id, otp_code, otp_expires_at, otp_attempts")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchErr) {
      console.error("[verify-otp] DB error:", fetchErr);
      return NextResponse.json({ error: "Verification service error. Please try again." }, { status: 500 });
    }

    if (!pending) {
      // Could be:
      // a) User never submitted the form (direct API call)
      // b) pending_registrations table doesn't exist yet (migration not run)
      return NextResponse.json(
        { error: "No pending registration found. Please go back and submit your form again." },
        { status: 404 }
      );
    }

    // ── Check expiry FIRST ────────────────────────────────────────
    if (!pending.otp_expires_at || new Date(pending.otp_expires_at) < new Date()) {
      // Clean up expired record
      await adminClient.from("pending_registrations").delete().eq("email", normalizedEmail);
      return NextResponse.json(
        { error: "This OTP has expired. Please go back and request a new one." },
        { status: 410 }
      );
    }

    // ── Check attempt limit ───────────────────────────────────────
    if ((pending.otp_attempts || 0) >= MAX_OTP_ATTEMPTS) {
      await adminClient.from("pending_registrations").delete().eq("email", normalizedEmail);
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please go back and request a new OTP." },
        { status: 429 }
      );
    }

    // ── Verify OTP ────────────────────────────────────────────────
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
            : "Incorrect code. You have no attempts remaining. Please request a new OTP.",
        },
        { status: 401 }
      );
    }

    // ✅ OTP correct — mark as verified in pending table
    // We do NOT delete the record yet — it gets consumed in the final POST /api/students
    await adminClient
      .from("pending_registrations")
      .update({
        otp_code: null,          // clear OTP so it can't be reused
        otp_expires_at: null,
        otp_attempts: 0,
        // Set a special marker via a very far future expiry on form_data
        // The record will be cleaned up by the final registration POST
        updated_at: new Date().toISOString(),
      })
      .eq("id", pending.id);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (err: unknown) {
    console.error("[verify-otp] Error:", err);
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
