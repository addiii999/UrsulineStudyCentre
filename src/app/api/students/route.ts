import { NextRequest, NextResponse } from "next/server";
import { supabase, createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

// ─── POST — Insert new student record ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminClient = createAdminClient();

    // Try inserting with is_deleted column first
    let { data, error } = await adminClient
      .from("students")
      .insert([{ ...body, is_deleted: false }])
      .select()
      .single();

    // Fallback if migration for is_deleted is not yet run
    if (error && error.code === "42703") {
      const fallbackInsert = await adminClient
        .from("students")
        .insert([body])
        .select()
        .single();
      data = fallbackInsert.data;
      error = fallbackInsert.error;
    }

    if (error) throw error;

    // Fire notification to admin dashboard
    const { createNotification } = await import("@/lib/notify");
    await createNotification({
      title: "New Admission Application",
      message: `${body.full_name} submitted an admission form.`,
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
    const { id, action, ...updates } = await req.json();
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

    // Normal field update
    const { error } = await adminClient
      .from("students")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    const { logAudit } = await import("@/lib/audit");
    await logAudit({
      action: "update",
      table_name: "students",
      item_id: id,
      item_label: updates.full_name || "Student Profile",
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
