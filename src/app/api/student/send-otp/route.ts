import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 15;
const MAX_RESENDS_PER_HOUR = 5;

function generateOTP(): string {
  // Cryptographically secure 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
}

function getOTPEmailHTML(name: string, otp: string): string {
  const digits = otp.split("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification - Ursuline Study Centre</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;max-width:560px;width:100%;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background-color:#800000;padding:28px 40px;text-align:center;">
            <p style="margin:0;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Ursuline Study Centre</p>
            <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;">Email Verification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1a202c;">Hello, ${name},</p>
            <p style="margin:0 0 28px;font-size:14px;color:#4a5568;line-height:1.7;">
              Please use the verification code below to confirm your email address and complete your admission registration.
            </p>

            <!-- OTP Digits -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                ${digits.map(d => `
                <td style="padding:0 4px;">
                  <div style="width:44px;height:56px;background:#fefce8;border:2px solid #C9A84C;border-radius:8px;text-align:center;line-height:56px;font-size:28px;font-weight:700;color:#1a202c;font-family:monospace;">${d}</div>
                </td>`).join("")}
              </tr>
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
              <tr>
                <td style="background:#fef2f2;border:1px solid #fee2e2;border-radius:6px;padding:12px 16px;">
                  <p style="margin:0;font-size:13px;color:#991b1b;">
                    This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. Do not share it with anyone.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#718096;line-height:1.6;">
              If you did not attempt to register at Ursuline Study Centre, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#718096;">
              Ursuline Study Centre &bull; Ranchi, Jharkhand
            </p>
            <p style="margin:4px 0 0;font-size:11px;color:#a0aec0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminClient = createAdminClient();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // ── Rate Limit: Max 5 sends per IP per hour ───────────────────
    const { data: recentByIp } = await adminClient
      .from("login_attempts")
      .select("id")
      .eq("ip_address", ip)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (recentByIp && recentByIp.length >= MAX_RESENDS_PER_HOUR) {
      return NextResponse.json(
        { error: "Too many requests from your network. Please wait before trying again." },
        { status: 429 }
      );
    }

    // ── Check if email is already fully registered + verified ─────
    const { data: existing } = await adminClient
      .from("students")
      .select("id, email_verified")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing?.email_verified) {
      return NextResponse.json(
        { error: "This email is already registered. Please log in to your student portal instead." },
        { status: 409 }
      );
    }

    // ── Generate OTP ──────────────────────────────────────────────
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // ── Upsert into pending_registrations (dedicated table) ───────
    // This avoids polluting the students table with stub records
    const { error: upsertErr } = await adminClient
      .from("pending_registrations")
      .upsert(
        [{
          email: normalizedEmail,
          name: (name || "Applicant").trim().substring(0, 100),
          otp_code: otp,
          otp_expires_at: expiresAt,
          otp_attempts: 0,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: "email" }
      );

    if (upsertErr) {
      console.error("[send-otp] Failed to store OTP:", upsertErr);
      return NextResponse.json({ error: "Failed to initiate verification. Please try again." }, { status: 500 });
    }

    // ── Log attempt (non-critical) ────────────────────────────────
    try {
      await adminClient.from("login_attempts").insert({
        ip_address: ip,
        email: normalizedEmail,
        is_success: false,
      });
    } catch { /* non-critical */ }

    // ── Send OTP Email ────────────────────────────────────────────
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass || emailPass === "your_app_password_here") {
      // Dev fallback: log OTP to console instead of failing
      console.log(`\n📧 [DEV] OTP for ${normalizedEmail}: ${otp}\n`);
      return NextResponse.json({
        success: true,
        message: "OTP logged to server console (email not configured)",
        dev_otp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
      pool: true,
    });

    // Verify connection before sending
    await transporter.verify();

    const displayName = (name || "Applicant").trim();

    await transporter.sendMail({
      from: {
        name: "Ursuline Study Centre Admissions",
        address: emailUser,
      },
      to: { name: displayName, address: normalizedEmail },
      subject: `Your verification code is ${otp} - Ursuline Study Centre`,
      html: getOTPEmailHTML(displayName, otp),
      text: `Hello ${displayName},\n\nYour email verification code for Ursuline Study Centre is:\n\n${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.\n\nIf you did not attempt to register, please ignore this email.\n\n---\nUrsuline Study Centre\nRanchi, Jharkhand`,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "List-Unsubscribe": `<mailto:${emailUser}?subject=unsubscribe>`,
        "Precedence": "transactional",
      },
    });

    return NextResponse.json({ success: true, message: "Verification code sent to your email." });

  } catch (err: unknown) {
    console.error("[send-otp] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
