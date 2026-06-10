import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { studentUpdateSchema, sanitizeText } from "@/lib/validation";

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

    // Admin Approval
    if (action === "approve") {
      const { error } = await adminClient
        .from("students")
        .update({ admission_status: "approved", updated_at: new Date().toISOString() })
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
        .update({ admission_status: "rejected", updated_at: new Date().toISOString() })
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
