import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { studentUpdateSchema, sanitizeText } from "@/lib/validation";

// ─── POST — Insert new student record ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic required field check
    if (!body.full_name || !body.present_phone) {
      return NextResponse.json(
        { error: "Missing required fields: full_name, present_phone" },
        { status: 400 }
      );
    }

    // Phone validation
    if (!/^\d{10}$/.test(body.present_phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Sanitize all text inputs
    const sanitizedBody: Record<string, string | boolean | null> = {
      full_name: sanitizeText(body.full_name || "", 100),
      dob: body.dob || null,
      aadhaar_last4: body.aadhaar_last4 || null,
      mother_name: sanitizeText(body.mother_name || "", 100),
      father_name: sanitizeText(body.father_name || "", 100),
      prev_board: sanitizeText(body.prev_board || "", 50),
      prev_school: sanitizeText(body.prev_school || "", 200),
      prev_year: sanitizeText(body.prev_year || "", 10),
      prev_marks: sanitizeText(body.prev_marks || "", 50),
      present_class: sanitizeText(body.present_class || "", 50),
      present_board: sanitizeText(body.present_board || "", 50),
      present_school: sanitizeText(body.present_school || "", 200),
      present_year: sanitizeText(body.present_year || "", 10),
      course: sanitizeText(body.course || "", 200),
      vocational: sanitizeText(body.vocational || "", 200),
      present_village: sanitizeText(body.present_village || "", 100),
      present_district: sanitizeText(body.present_district || "", 100),
      present_ps: sanitizeText(body.present_ps || "", 100),
      present_phone: body.present_phone,
      permanent_village: sanitizeText(body.permanent_village || "", 100),
      permanent_district: sanitizeText(body.permanent_district || "", 100),
      permanent_ps: sanitizeText(body.permanent_ps || "", 100),
      permanent_phone: sanitizeText(body.permanent_phone || "", 10),
      session: "2026-27",
      admission_status: "applied",
    };

    const adminClient = createAdminClient();

    // Try inserting with is_deleted column
    let { data, error } = await adminClient
      .from("students")
      .insert([{ ...sanitizedBody, is_deleted: false }])
      .select()
      .single();

    // Fallback if is_deleted column doesn't exist yet
    if (error && error.code === "42703") {
      const fallback = await adminClient
        .from("students")
        .insert([sanitizedBody])
        .select()
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("Student insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Auto-create Enquiry ──────────────────────────────────
    const enquiryPayload = {
      name: String(sanitizedBody.full_name),
      phone: String(sanitizedBody.present_phone),
      class: String(sanitizedBody.present_class || sanitizedBody.course || ""),
      stream: String(sanitizedBody.course || ""),
      message: `Admission form submitted. Course: ${sanitizedBody.course || "-"}. Vocational: ${sanitizedBody.vocational || "-"}. Board: ${sanitizedBody.present_board || "-"}.`,
      source: "admission_form",
      status: "new",
    };

    const enqResult = await adminClient
      .from("enquiries")
      .insert([{ ...enquiryPayload, is_deleted: false }]);

    if (enqResult.error && enqResult.error.code === "42703") {
      // Fallback without is_deleted
      try { await adminClient.from("enquiries").insert([enquiryPayload]); } catch { /* ignore */ }
    }

    // Fire notification (non-blocking)
    try {
      const { createNotification } = await import("@/lib/notify");
      await createNotification({
        title: "New Admission Application",
        message: `${sanitizedBody.full_name} submitted an admission form. Course: ${sanitizedBody.course}`,
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

// ─── GET — Fetch students ────────────────────────────────────
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
      let fallback = adminClient
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (!trashed) {
        if (status) fallback = fallback.eq("admission_status", status);
        else fallback = fallback.neq("admission_status", "archived");
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

// ─── PATCH — Update student fields ──────────────────────────
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

    const validation = studentUpdateSchema.safeParse({ id, ...updates });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const sanitizedUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "string" && !["id", "admission_status", "session"].includes(key)) {
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

// ─── DELETE — Soft or permanent delete ──────────────────────
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

      if (error) {
        if (error.code === "42703") {
          return NextResponse.json(
            { error: "Database migration required. Run 'supabase_migration_students_softdelete.sql'.", migrationNeeded: true },
            { status: 409 }
          );
        }
        throw error;
      }

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
