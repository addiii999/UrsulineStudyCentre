import nodemailer from "nodemailer";
import { SITE_CONFIG } from "@/lib/constants";

interface EnquiryEmailData {
  name: string;
  phone: string;
  studentClass: string;
  stream: string;
  message: string;
  submittedAt: string;
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be Gmail App Password
    },
  });
};

// ─── Send Admin Notification ────────────────────────────────────────────────
export async function sendAdminNotification(data: EnquiryEmailData): Promise<void> {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #800000; padding: 28px 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .header p { color: #C9A84C; margin: 4px 0 0; font-size: 13px; }
        .badge { background: #C9A84C; color: white; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 20px; display: inline-block; margin-top: 10px; }
        .body { padding: 32px; }
        .field { margin-bottom: 18px; }
        .field label { font-size: 11px; font-weight: 700; color: #800000; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
        .field .value { font-size: 15px; color: #1a1a1a; font-weight: 500; background: #FDF8F0; border: 1px solid #e8d9b8; border-radius: 8px; padding: 10px 14px; }
        .message-box { background: #FDF8F0; border: 1px solid #e8d9b8; border-radius: 8px; padding: 12px 14px; font-size: 14px; color: #444; line-height: 1.6; }
        .divider { border: none; border-top: 1px solid #f0ebe0; margin: 24px 0; }
        .footer { background: #faf7f2; padding: 18px 32px; text-align: center; }
        .footer p { color: #888; font-size: 12px; margin: 0; }
        .cta { display: inline-block; margin-top: 16px; background: #800000; color: white !important; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Ursuline Study Centre</h1>
          <p>New Enquiry Received</p>
          <span class="badge">⚡ Action Required</span>
        </div>
        <div class="body">
          <p style="color:#555; font-size:14px; margin-top:0;">A new student enquiry has been submitted. Please review and follow up as soon as possible.</p>
          
          <div class="field">
            <label>Student Name</label>
            <div class="value">👤 ${data.name}</div>
          </div>
          <div class="field">
            <label>Phone Number</label>
            <div class="value">📞 ${data.phone}</div>
          </div>
          <div class="field">
            <label>Class</label>
            <div class="value">📚 ${data.studentClass}</div>
          </div>
          ${data.stream ? `
          <div class="field">
            <label>Stream / Subject</label>
            <div class="value">🔬 ${data.stream}</div>
          </div>` : ""}
          ${data.message ? `
          <div class="field">
            <label>Message from Student</label>
            <div class="message-box">💬 ${data.message}</div>
          </div>` : ""}
 
          <hr class="divider">
          
          <div class="field">
            <label>Submitted At</label>
            <div class="value">🕐 ${data.submittedAt}</div>
          </div>
 
          <div style="text-align:center; margin-top:24px;">
            <a href="https://ursulinstudycentre.in/login" class="cta">
              Open Admin Panel →
            </a>
          </div>
        </div>
        <div class="footer">
          <p>Ursuline Study Centre · Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi</p>
          <p style="margin-top:4px;">This is an automated notification. Do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
 
  await transporter.sendMail({
    from: `"Ursuline Study Centre 🎓" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // ursulinestudycentre@gmail.com
    subject: `🔔 New Enquiry — ${data.name} (${data.studentClass})`,
    html,
  });
}
 
// ─── Send Auto-Reply to Student ──────────────────────────────────────────────
export async function sendStudentAutoReply(
  studentName: string,
  studentPhone: string
): Promise<void> {
  // Auto-reply requires student's email — if not collected, skip gracefully
  // This function is a placeholder for when email field is added to the form
  const transporter = createTransporter();
 
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #800000; padding: 28px 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .header p { color: #C9A84C; margin: 4px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .footer { background: #faf7f2; padding: 18px 32px; text-align: center; }
        .footer p { color: #888; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Ursuline Study Centre</h1>
          <p>Empowering Students. Building Futures.</p>
        </div>
        <div class="body">
          <h2 style="color:#800000; margin-top:0;">Dear ${studentName},</h2>
          <p style="color:#555; font-size:15px; line-height:1.7;">
            Thank you for reaching out to <strong>Ursuline Study Centre</strong>. We have received your enquiry and our team will contact you shortly at <strong>${studentPhone}</strong>.
          </p>
          <p style="color:#555; font-size:15px; line-height:1.7;">
            We look forward to helping you achieve your academic goals!
          </p>
          <div style="background:#FDF8F0; border:1px solid #e8d9b8; border-radius:8px; padding:16px; margin:20px 0;">
            <p style="margin:0; font-size:13px; color:#800000; font-weight:600;">📍 Visit Us:</p>
            <p style="margin:6px 0 0; font-size:13px; color:#555;">Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi</p>
            <p style="margin:4px 0 0; font-size:13px; color:#555;">📞 ${SITE_CONFIG.phone} | ${SITE_CONFIG.phone2}</p>
          </div>
        </div>
        <div class="footer">
          <p>Ursuline Study Centre · Premium Educational Institution</p>
        </div>
      </div>
    </body>
    </html>
  `;
 
  await transporter.sendMail({
    from: `"Ursuline Study Centre 🎓" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // will send to admin as CC for record
    subject: `Auto-reply sent to ${studentName}`,
    html,
  });
}

