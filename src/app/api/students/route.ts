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
  if (!checkAdminAuth(req)) {
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
      .order("created_at", { ascending: false });

    if (status) query = query.eq("admission_status", status);
    if (session) query = query.eq("session", session);

    const { data, error } = await query;
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
  if (!checkAdminAuth(req)) {
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
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
