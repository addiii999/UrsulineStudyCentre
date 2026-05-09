import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";

// Rate limit: max 3 OTP sends per email per 10 minutes
const OTP_EXPIRY_MINUTES = 10;

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function getOTPEmailHTML(name: string, otp: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#FDF8F0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF8F0;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8d9b8;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#800000;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Ursuline Study Centre</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Email Verification</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear <strong>${name}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.6;">
            You're one step away from completing your admission application. Please use the verification code below to confirm your email address.
          </p>
          <!-- OTP Box -->
          <div style="background:#FDF8F0;border:2px solid #C9A84C;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#800000;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
            <p style="margin:0;font-size:40px;font-weight:700;color:#1F2937;letter-spacing:8px;font-family:monospace;">${otp}</p>
            <p style="margin:12px 0 0;font-size:12px;color:#9CA3AF;">Expires in ${OTP_EXPIRY_MINUTES} minutes</p>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#6B7280;line-height:1.6;">
            If you did not register at Ursuline Study Centre, please ignore this email. Do not share this code with anyone.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#F9F5EE;border-top:1px solid #e8d9b8;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">Ursuline Study Centre · Ranchi, Jharkhand</p>
          <p style="margin:4px 0 0;font-size:11px;color:#C9A84C;">Empowering Girls. Building Futures.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Rate limit: check how many OTPs sent from this IP in the last 10 min
    const { data: recentAttempts } = await adminClient
      .from("login_attempts")
      .select("id")
      .eq("ip_address", ip)
      .eq("is_success", false)
      .gt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (recentAttempts && recentAttempts.length >= 5) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 10 minutes before trying again." },
        { status: 429 }
      );
    }

    // Check for duplicate registered + verified email
    const { data: existingStudent } = await adminClient
      .from("students")
      .select("id, email_verified")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existingStudent?.email_verified) {
      return NextResponse.json(
        { error: "This email is already registered. Please log in instead." },
        { status: 409 }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Store OTP in DB. If student record exists (unverified), update it. Otherwise store pending.
    if (existingStudent) {
      await adminClient
        .from("students")
        .update({ otp_code: otp, otp_expires_at: expiresAt, otp_attempts: 0 })
        .eq("id", existingStudent.id);
    } else {
      // Store email→OTP mapping in login_attempts temporarily for pre-registration flow
      // The actual record gets created after OTP is verified in the apply form.
      // We store OTP separately in a "pending" record keyed by email.
      // Strategy: We upsert a pre-registration entry in students table with minimal info.
      await adminClient
        .from("students")
        .upsert([{
          email: email.toLowerCase().trim(),
          full_name: name || "Pending",
          present_phone: "",
          course: "pending",
          otp_code: otp,
          otp_expires_at: expiresAt,
          otp_attempts: 0,
          email_verified: false,
          approval_status: "pending",
          admission_status: "applied",
        }], { onConflict: "email" })
        .select("id");
    }

    // Log the attempt (non-critical)
    try {
      await adminClient.from("login_attempts").insert({
        ip_address: ip, email: email, is_success: false,
      });
    } catch { /* ignore */ }

    // Send OTP via nodemailer (Gmail SMTP)
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"USC Admissions" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${otp} — Email Verification | Ursuline Study Centre`,
      html: getOTPEmailHTML(name || "Applicant", otp),
    });

    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (err: unknown) {
    console.error("Send OTP error:", err);
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
