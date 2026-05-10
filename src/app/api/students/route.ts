import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { studentUpdateSchema, sanitizeText } from "@/lib/validation";
import bcrypt from "bcryptjs";

// POST — Complete student registration after OTP verified
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();

    // Input validation
    if (!email || !body.present_phone || !body.full_name) {
      return NextResponse.json(
        { error: "Missing required fields: full_name, email, present_phone" },
        { status: 400 }
      );
    }
    if (!/^\d{10}$/.test(body.present_phone)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Verify OTP was completed via pending_registrations table.
    // After verify-otp succeeds it sets otp_code = null (verified marker).
    const { data: pending, error: pendingErr } = await adminClient
      .from("pending_registrations")
      .select("id, otp_code")
      .eq("email", email)
      .maybeSingle();

    if (pendingErr) {
      console.error("[students POST] pending_registrations lookup error:", pendingErr);
      const code = (pendingErr as { code?: string }).code;
      if (code === "42P01") {
        return NextResponse.json(
          { error: "Server configuration incomplete. Please run supabase_pending_registrations.sql in Supabase." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: "Verification check failed. Please try again." }, { status: 500 });
    }

    if (!pending) {
      return NextResponse.json(
        { error: "Your verification session was not found. Please go back and complete OTP verification again." },
        { status: 403 }
      );
    }

    // otp_code is null only after successful verification
    if (pending.otp_code !== null) {
      return NextResponse.json(
        { error: "Email not yet verified. Please complete OTP verification before submitting." },
        { status: 403 }
      );
    }

    // Check for duplicate email
    const { data: existingStudent } = await adminClient
      .from("students")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingStudent) {
      // Clean up stale pending record
      await adminClient.from("pending_registrations").delete().eq("id", pending.id);
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 12);

    // Build sanitized student record
    const record: Record<string, string | boolean | null> = {
      full_name:          sanitizeText(body.full_name || "", 100),
      email,
      dob:                body.dob || null,
      aadhaar_last4:      body.aadhaar_last4 || null,
      mother_name:        sanitizeText(body.mother_name || "", 100),
      father_name:        sanitizeText(body.father_name || "", 100),
      prev_board:         sanitizeText(body.prev_board || "", 50),
      prev_school:        sanitizeText(body.prev_school || "", 200),
      prev_year:          sanitizeText(body.prev_year || "", 10),
      prev_marks:         sanitizeText(body.prev_marks || "", 50),
      present_class:      sanitizeText(body.present_class || "", 50),
      present_board:      sanitizeText(body.present_board || "", 50),
      present_school:     sanitizeText(body.present_school || "", 200),
      present_year:       sanitizeText(body.present_year || "", 10),
      course:             sanitizeText(body.course || "General", 200),
      vocational:         sanitizeText(body.vocational || "", 200),
      present_village:    sanitizeText(body.present_village || "", 100),
      present_district:   sanitizeText(body.present_district || "", 100),
      present_ps:         sanitizeText(body.present_ps || "", 100),
      present_phone:      body.present_phone,
      permanent_village:  sanitizeText(body.permanent_village || "", 100),
      permanent_district: sanitizeText(body.permanent_district || "", 100),
      permanent_ps:       sanitizeText(body.permanent_ps || "", 100),
      permanent_phone:    sanitizeText(body.permanent_phone || "", 15),
      password_hash:      passwordHash,
      session:            "2026-27",
      admission_status:   "applied",
      approval_status:    "pending",
      email_verified:     true,
      is_deleted:         false,
    };

    // Insert final student record (clean INSERT — no stub)
    const { data: newStudent, error: insertErr } = await adminClient
      .from("students")
      .insert([record])
      .select("id")
      .single();

    if (insertErr) {
      console.error("[students POST] Insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create student account. Please try again." }, { status: 500 });
    }

    const studentId = newStudent.id;

    // Clean up pending_registrations record
    await adminClient.from("pending_registrations").delete().eq("id", pending.id);

    // Auto-create Enquiry in Admin Pipeline
    const enquiryRow = {
      name:       String(record.full_name),
      phone:      String(record.present_phone),
      class:      String(record.present_class || record.course || ""),
      stream:     String(record.course || ""),
      message:    `[Online Application] Email: ${email}. Course: ${record.course || "-"}. Vocational: ${record.vocational || "-"}. Board: ${record.present_board || "-"}.`,
      source:     "admission_form",
      status:     "new",
      is_deleted: false,
      student_id: studentId,
    };

    try {
      await adminClient.from("enquiries").insert([enquiryRow]);
    } catch {
      try {
        await adminClient.from("enquiries").insert([{
          name:    enquiryRow.name,
          phone:   enquiryRow.phone,
          class:   enquiryRow.class,
          stream:  enquiryRow.stream,
          message: enquiryRow.message,
          source:  enquiryRow.source,
          status:  enquiryRow.status,
        }]);
      } catch { /* non-critical */ }
    }

    // Admin Notification (non-blocking)
    try {
      const { createNotification } = await import("@/lib/notify");
      await createNotification({
        title: "New Student Application",
        message: `${record.full_name} completed registration. Course: ${record.course}. Awaiting admin approval.`,
        type: "enquiry",
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, id: studentId }, { status: 201 });

  } catch (err: unknown) {
    console.error("[students POST] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — Fetch students (admin only)
export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const status  = searchParams.get("status");
    const session = searchParams.get("session");
    const trashed = searchParams.get("trashed") === "true";
    const adminClient = createAdminClient();

    let query = adminClient
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (trashed) {
      query = query.eq("is_deleted", true);
    } else {
      query = query.eq("is_deleted", false);
      if (status)  query = query.eq("admission_status", status);
      if (session) query = query.eq("session", session);
    }

    const { data, error } = await query;

    if (error && error.code === "42703") {
      // Fallback if is_deleted column is missing
      let fallback = adminClient
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (!trashed) {
        if (status) fallback = fallback.eq("admission_status", status);
      }
      if (session) fallback = fallback.eq("session", session);
      const { data: fbData, error: fbErr } = await fallback;
      if (fbErr) throw fbErr;
      return NextResponse.json({ students: fbData ?? [], migrationNeeded: true });
    }

    if (error) throw error;
    return NextResponse.json(
      { students: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH — Update student fields (admin only)
export async function PATCH(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, action, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const adminClient = createAdminClient();

    if (action === "restore") {
      const { error } = await adminClient
        .from("students")
        .update({ is_deleted: false, deleted_at: null, deleted_by: null, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      try {
        const { logAudit } = await import("@/lib/audit");
        await logAudit({ action: "restore", table_name: "students", item_id: id });
      } catch {}
      return NextResponse.json({ success: true });
    }

    // Admin Password Reset (no OTP needed)
    if (action === "reset_password") {
      const { new_password } = updates;
      if (!new_password || new_password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(new_password, 12);
      const { error } = await adminClient
        .from("students")
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      try {
        const { logAudit } = await import("@/lib/audit");
        await logAudit({ action: "reset_password", table_name: "students", item_id: id, item_label: "Admin password reset" });
      } catch {}
      return NextResponse.json({ success: true });
    }

    // Admin Approval
    if (action === "approve") {
      const { error } = await adminClient
        .from("students")
        .update({ approval_status: "approved", admission_status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      try {
        const { logAudit } = await import("@/lib/audit");
        await logAudit({ action: "approve", table_name: "students", item_id: id, item_label: "Student Approved" });
      } catch {}
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      const { error } = await adminClient
        .from("students")
        .update({ approval_status: "rejected", admission_status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      try {
        const { logAudit } = await import("@/lib/audit");
        await logAudit({ action: "reject", table_name: "students", item_id: id, item_label: "Student Rejected" });
      } catch {}
      return NextResponse.json({ success: true });
    }

    // General field update
    const validation = studentUpdateSchema.safeParse({ id, ...updates });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const sanitizedUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "string" && !["id", "admission_status", "session", "approval_status"].includes(key)) {
        sanitizedUpdates[key] = sanitizeText(value, 200);
      } else {
        sanitizedUpdates[key] = value;
      }
    }

    const { error } = await adminClient
      .from("students")
      .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;

    try {
      const { logAudit } = await import("@/lib/audit");
      await logAudit({
        action: "update", table_name: "students", item_id: id,
        item_label: String(sanitizedUpdates.full_name || "Student Profile"),
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — Soft or permanent delete (admin only)
export async function DELETE(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id        = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const adminClient = createAdminClient();

    if (permanent) {
      const { error } = await adminClient.from("students").delete().eq("id", id);
      if (error) throw error;
      try {
        const { logAudit } = await import("@/lib/audit");
        await logAudit({ action: "permanent_delete", table_name: "students", item_id: id, item_label: "Student Record" });
      } catch {}
      return NextResponse.json({ success: true, deleted: "permanent" });
    } else {
      const { error } = await adminClient
        .from("students")
        .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: "admin", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      try {
        const { logAudit } = await import("@/lib/audit");
        await logAudit({ action: "soft_delete", table_name: "students", item_id: id, item_label: "Student Record" });
      } catch {}
      return NextResponse.json({ success: true, deleted: "soft" });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
