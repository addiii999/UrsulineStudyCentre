import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { studentUpdateSchema, sanitizeText } from "@/lib/validation";
import bcrypt from "bcryptjs";

// ─── POST — Complete student registration after OTP verified ───────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Required auth fields
    if (!body.email || !body.present_phone || !body.full_name) {
      return NextResponse.json(
        { error: "Missing required fields: full_name, email, present_phone" },
        { status: 400 }
      );
    }

    // Phone validation
    if (!/^\d{10}$/.test(body.present_phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const email = body.email.toLowerCase().trim();

    // Find the pre-registration record (created during OTP send)
    const { data: preReg, error: findErr } = await adminClient
      .from("students")
      .select("id, email_verified, approval_status")
      .eq("email", email)
      .maybeSingle();

    // Email MUST be verified before we save the full registration
    if (!preReg || !preReg.email_verified) {
      return NextResponse.json(
        { error: "Email not verified. Please complete OTP verification first." },
        { status: 403 }
      );
    }

    // Hash the password securely
    const passwordHash = body.password_hash
      ? body.password_hash  // admin-sent pre-hashed (unlikely)
      : body.password
        ? await bcrypt.hash(body.password, 12)
        : null;

    if (!passwordHash) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Sanitize all text inputs
    const sanitizedBody: Record<string, string | boolean | null> = {
      full_name:          sanitizeText(body.full_name || "", 100),
      email:              email,
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
      course:             sanitizeText(body.course || "", 200),
      vocational:         sanitizeText(body.vocational || "", 200),
      present_village:    sanitizeText(body.present_village || "", 100),
      present_district:   sanitizeText(body.present_district || "", 100),
      present_ps:         sanitizeText(body.present_ps || "", 100),
      present_phone:      body.present_phone,
      permanent_village:  sanitizeText(body.permanent_village || "", 100),
      permanent_district: sanitizeText(body.permanent_district || "", 100),
      permanent_ps:       sanitizeText(body.permanent_ps || "", 100),
      permanent_phone:    sanitizeText(body.permanent_phone || "", 10),
      password_hash:      passwordHash,
      session:            "2026-27",
      admission_status:   "applied",
      approval_status:    "pending",
      email_verified:     true,
      is_deleted:         false,
    };

    // Update the pre-registration record with full data
    const { data, error } = await adminClient
      .from("students")
      .update(sanitizedBody)
      .eq("id", preReg.id)
      .select()
      .single();

    if (error) {
      console.error("Student update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Auto-create Enquiry in Admin Pipeline ────────────────
    const enquiryPayload = {
      name:       String(sanitizedBody.full_name),
      phone:      String(sanitizedBody.present_phone),
      class:      String(sanitizedBody.present_class || sanitizedBody.course || ""),
      stream:     String(sanitizedBody.course || ""),
      message:    `[Verified Application] Email: ${email}. Course: ${sanitizedBody.course || "-"}. Vocational: ${sanitizedBody.vocational || "-"}. Board: ${sanitizedBody.present_board || "-"}.`,
      source:     "admission_form",
      status:     "new",
      is_deleted: false,
      student_id: preReg.id,
    };

    try {
      await adminClient.from("enquiries").insert([enquiryPayload]);
    } catch {
      // Fallback without optional columns
      try {
        await adminClient.from("enquiries").insert([{
          name:    enquiryPayload.name,
          phone:   enquiryPayload.phone,
          class:   enquiryPayload.class,
          stream:  enquiryPayload.stream,
          message: enquiryPayload.message,
          source:  enquiryPayload.source,
          status:  enquiryPayload.status,
        }]);
      } catch { /* non-critical */ }
    }

    // ── Fire Admin Notification (non-blocking) ───────────────
    try {
      const { createNotification } = await import("@/lib/notify");
      await createNotification({
        title: "New Verified Application",
        message: `${sanitizedBody.full_name} completed email verification. Awaiting approval. Course: ${sanitizedBody.course}`,
        type: "enquiry",
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("Student POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── GET — Fetch students (admin only) ─────────────────────────────────────────
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

// ─── PATCH — Update student fields (admin only) ───────────────────────────────
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
        await logAudit({ action: "restore", table_name: "students", item_id: id }).catch(() => {});
      } catch {}
      return NextResponse.json({ success: true });
    }

    // ── Admin Password Reset (no OTP needed) ─────────────────
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
        await logAudit({ action: "reset_password", table_name: "students", item_id: id, item_label: "Admin password reset" }).catch(() => {});
      } catch {}
      return NextResponse.json({ success: true });
    }

    // ── Admin Approval toggle ─────────────────────────────────
    if (action === "approve") {
      const { error } = await adminClient
        .from("students")
        .update({
          approval_status: "approved",
          admission_status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      try {
        const { logAudit } = await import("@/lib/audit");
        await logAudit({ action: "approve", table_name: "students", item_id: id, item_label: "Student Approved" }).catch(() => {});
      } catch {}
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      const { error } = await adminClient
        .from("students")
        .update({
          approval_status: "rejected",
          admission_status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ── General field update ──────────────────────────────────
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
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE — Soft or permanent delete (admin only) ───────────────────────────
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
        await logAudit({ action: "permanent_delete", table_name: "students", item_id: id, item_label: "Student Record" }).catch(() => {});
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
        await logAudit({ action: "soft_delete", table_name: "students", item_id: id, item_label: "Student Record" }).catch(() => {});
      } catch {}

      return NextResponse.json({ success: true, deleted: "soft" });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
