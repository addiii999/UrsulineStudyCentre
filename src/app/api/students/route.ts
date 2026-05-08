import { NextRequest, NextResponse } from "next/server";
import { supabase, createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { studentUpdateSchema, sanitizeText } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimit";

// ─── POST — Insert new student record ───────────────────────
export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req);
  
  // Rate limiting: 2 applications per 24 hours per IP
  const rateLimit = checkRateLimit(`student-application:${clientId}`, RATE_LIMITS.studentApplication);
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "You have already submitted an application recently. Please wait before submitting another." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    
    // Sanitize all text inputs
    const sanitizedBody = {
      ...body,
      full_name: sanitizeText(body.full_name, 100),
      mother_name: sanitizeText(body.mother_name, 100),
      father_name: sanitizeText(body.father_name, 100),
      prev_school: sanitizeText(body.prev_school, 200),
      present_school: sanitizeText(body.present_school, 200),
      present_village: sanitizeText(body.present_village, 100),
      present_district: sanitizeText(body.present_district, 100),
      present_ps: sanitizeText(body.present_ps, 100),
      permanent_village: sanitizeText(body.permanent_village, 100),
      permanent_district: sanitizeText(body.permanent_district, 100),
      permanent_ps: sanitizeText(body.permanent_ps, 100),
    };
    
    const adminClient = createAdminClient();

    // Try inserting with is_deleted column first
    let { data, error } = await adminClient
      .from("students")
      .insert([{ ...sanitizedBody, is_deleted: false }])
      .select()
      .single();

    // Fallback if migration for is_deleted is not yet run
    if (error && error.code === "42703") {
      const fallbackInsert = await adminClient
        .from("students")
        .insert([sanitizedBody])
        .select()
        .single();
      data = fallbackInsert.data;
      error = fallbackInsert.error;
    }

    if (error) throw error;

    // ── Auto-create Enquiry so Admin sees this registration in the pipeline ──
    // Use upsert on phone to avoid duplicates if enquiry already exists
    const enquiryPayload: any = {
      name: sanitizedBody.full_name,
      phone: sanitizedBody.present_phone,
      class: sanitizedBody.present_class || "",
      stream: sanitizedBody.course || "",
      message: `Admission form submitted. Course: ${sanitizedBody.course || "-"}, Board: ${sanitizedBody.present_board || "-"}.`,
      source: "admission_form",
      status: "new",
    };

    // Only set is_deleted if migration has been run
    const enquiryInsert = await adminClient.from("enquiries").insert([{ ...enquiryPayload, is_deleted: false }]);
    if (enquiryInsert.error && enquiryInsert.error.code === "42703") {
      // Fallback without is_deleted column
      try { await adminClient.from("enquiries").insert([enquiryPayload]); } catch (e) { /* ignore */ }
    }

    // Fire notification to admin dashboard
    const { createNotification } = await import("@/lib/notify");
    await createNotification({
      title: "New Admission Application",
      message: `${sanitizedBody.full_name} submitted an admission form.`,
      type: "enquiry",
    }).catch(() => {}); // non-blocking

    return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
  } catch (err: any) {
    console.error("Student POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── GET — Fetch students (active or trashed) ───────────────
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
      // Trash view — only soft-deleted records
      query = query.eq("is_deleted", true);
    } else {
      // Normal view — only active records
      query = query.eq("is_deleted", false);
      if (status)  query = query.eq("admission_status", status);
      if (session) query = query.eq("session", session);
    }

    const { data, error } = await query;

    // 42703 = column does not exist (migration not yet run)
    if (error && error.code === "42703") {
      // Graceful degradation: filter by status instead
      let fallback = adminClient
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (!trashed) {
        if (status) fallback = fallback.eq("admission_status", status);
        else        fallback = fallback.neq("admission_status", "archived");
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
  } catch (err: any) {
    console.error("Student GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
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

    // Special action: restore from trash
    if (action === "restore") {
      const { error } = await adminClient
        .from("students")
        .update({
          is_deleted:       false,
          deleted_at:       null,
          deleted_by:       null,
          updated_at:       new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      const { logAudit } = await import("@/lib/audit");
      await logAudit({ action: "restore", table_name: "students", item_id: id }).catch(() => {});
      return NextResponse.json({ success: true });
    }

    // Validate update data
    const validation = studentUpdateSchema.safeParse({ id, ...updates });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Sanitize text fields
    const sanitizedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "string" && !["id", "admission_status", "session"].includes(key)) {
        sanitizedUpdates[key] = sanitizeText(value, 200);
      } else {
        sanitizedUpdates[key] = value;
      }
    }

    // Normal field update
    const { error } = await adminClient
      .from("students")
      .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    const { logAudit } = await import("@/lib/audit");
    await logAudit({
      action: "update",
      table_name: "students",
      item_id: id,
      item_label: sanitizedUpdates.full_name || "Student Profile",
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Student PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── DELETE — Soft delete OR permanent delete ───────────────
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
      // ── PERMANENT DELETE ──────────────────────────────────
      const { error } = await adminClient
        .from("students")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const { logAudit } = await import("@/lib/audit");
      await logAudit({
        action: "permanent_delete",
        table_name: "students",
        item_id: id,
        item_label: "Student Record",
      }).catch(() => {});

      return NextResponse.json({ success: true, deleted: "permanent" });

    } else {
      // ── SOFT DELETE (archive → Trash) ─────────────────────
      const { error } = await adminClient
        .from("students")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: "admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        if (error.code === "42703") {
          // Migration not run yet — columns don't exist
          return NextResponse.json(
            {
              error:
                "Database migration required. Please run 'supabase_migration_students_softdelete.sql' in your Supabase SQL Editor, then try again.",
              migrationNeeded: true,
            },
            { status: 409 }
          );
        }
        throw error;
      }

      const { logAudit } = await import("@/lib/audit");
      await logAudit({
        action: "soft_delete",
        table_name: "students",
        item_id: id,
        item_label: "Student Record",
      }).catch(() => {});

      return NextResponse.json({ success: true, deleted: "soft" });
    }
  } catch (err: any) {
    console.error("Student DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
