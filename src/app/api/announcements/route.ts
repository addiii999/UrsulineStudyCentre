import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ announcements: data ?? [] }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("announcements")
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
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("announcements")
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
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("announcements").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
