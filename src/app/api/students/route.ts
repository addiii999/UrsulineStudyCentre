import { NextRequest, NextResponse } from "next/server";
import { supabase, createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

// POST — Admin update a student record (status, notes)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("students")
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — Admin: fetch all students
export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const session = searchParams.get("session");

    const adminClient = createAdminClient();
    let query = adminClient
      .from("students")
      .select("*")
      .eq("is_deleted", false) // Do not return deleted records
      .order("created_at", { ascending: false });

    if (status) query = query.eq("admission_status", status);
    if (session) query = query.eq("session", session);

    const { data, error } = await query;
    // Suppress missing column error temporarily if user hasn't ran the migration yet
    if (error && error.code === '42703') {
       // Fallback for schema mismatch: just fetch without is_deleted
       let fallbackQuery = adminClient.from("students").select("*").order("created_at", { ascending: false });
       if (status) fallbackQuery = fallbackQuery.eq("admission_status", status);
       if (session) fallbackQuery = fallbackQuery.eq("session", session);
       const { data: fbData } = await fallbackQuery;
       return NextResponse.json({ students: fbData ?? [] });
    }
    if (error) throw error;

    return NextResponse.json({ students: data ?? [] }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — Admin: update student status or notes
export async function PATCH(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, ...updates } = await req.json();
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("students")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    const { logAudit } = await import("@/lib/audit");
    await logAudit({ action: "update", table_name: "students", item_id: id, item_label: updates.full_name || "Student Profile" }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — Soft Delete
export async function DELETE(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("students")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
       // If column missing, just change status
       if (error.code === '42703') {
         await adminClient.from("students").update({ admission_status: "rejected" }).eq("id", id);
       } else {
         throw error;
       }
    }

    const { logAudit } = await import("@/lib/audit");
    await logAudit({ action: "soft_delete", table_name: "students", item_id: id }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
