import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("*").eq("is_deleted", false)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ faqs: data ?? [] }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Session expired. Please log in to the admin panel again." }, { status: 401 });
  try {
    const body = await req.json();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("faqs")
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Session expired. Please log in to the admin panel again." }, { status: 401 });
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("faqs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Session expired. Please log in to the admin panel again." }, { status: 401 });
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("faqs").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);

    if (error) throw error;
    logAudit({ action: "soft_delete", table_name: "faqs", item_id: id }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
