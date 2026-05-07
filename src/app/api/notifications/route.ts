import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

// ─── GET: latest 30 notifications (admin only) ──────────────
export async function GET(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    return NextResponse.json(
      { notifications: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    console.error("Notifications GET:", err);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}

// ─── PATCH: mark one or all as read ─────────────────────────
export async function PATCH(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const adminClient = createAdminClient();

    if (body.markAll) {
      // Mark ALL unread as read
      const { error } = await adminClient
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    } else if (body.id) {
      // Mark single notification as read
      const { error } = await adminClient
        .from("notifications")
        .update({ is_read: true })
        .eq("id", body.id);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: "id or markAll required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Notifications PATCH:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ─── DELETE: clear all notifications (admin only) ───────────
export async function DELETE(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const adminClient = createAdminClient();
    // Delete all — uses a truthy filter to satisfy RLS
    const { error } = await adminClient
      .from("notifications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Notifications DELETE:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
