import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("faq")
      .select("*").eq("is_deleted", false)
      .order("display_order", { ascending: true })
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
  if (!(await checkAdminAuth(req))) return NextResponse.json({ error: "Session expired. Please log in to the admin panel again." }, { status: 401 });
  try {
    const body = await req.json();
    const adminClient = createAdminClient();
    
    // Map sort_order to display_order if present
    const payload = { ...body };
    if (payload.sort_order !== undefined) {
      payload.display_order = payload.sort_order;
      delete payload.sort_order;
    }

    const { data, error } = await adminClient
      .from("faq")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/faq");
    revalidatePath("/");
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdminAuth(req))) return NextResponse.json({ error: "Session expired. Please log in to the admin panel again." }, { status: 401 });
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Map sort_order to display_order if present
    if (updates.sort_order !== undefined) {
      updates.display_order = updates.sort_order;
      delete updates.sort_order;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("faq")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/faq");
    revalidatePath("/");
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdminAuth(req))) return NextResponse.json({ error: "Session expired. Please log in to the admin panel again." }, { status: 401 });
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("faq").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);

    if (error) throw error;
    logAudit({ action: "soft_delete", table_name: "faq", item_id: id }).catch(() => {});
    revalidatePath("/faq");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
