import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

// ── Helpers ────────────────────────────────────────────────────────────────────
function extractVideoId(input: string): string | null {
  if (!input) return null;
  // Handles:
  //   https://youtu.be/vR58BY1Ai0s
  //   https://www.youtube.com/watch?v=vR58BY1Ai0s
  //   https://www.youtube.com/shorts/vR58BY1Ai0s
  //   vR58BY1Ai0s (raw ID)
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = input.match(re);
    if (m) return m[1];
  }
  return null;
}

// ── GET — list all active videos (public) or all (admin) ──────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin") === "true";
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const supabase = createAdminClient();
    let query = supabase
      .from("videos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!admin) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) {
      console.error("[Videos GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ videos: data ?? [] });
  } catch (err) {
    console.error("[Videos GET] Unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST — add a new video ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { url, title } = body;

    if (!url?.trim()) {
      return NextResponse.json({ error: "YouTube URL is required." }, { status: 400 });
    }

    const video_id = extractVideoId(url.trim());
    if (!video_id) {
      return NextResponse.json(
        { error: "Could not extract a valid YouTube video ID from the provided URL." },
        { status: 400 }
      );
    }

    const thumbnail = `https://img.youtube.com/vi/${video_id}/hqdefault.jpg`;
    const maxres_thumbnail = `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`;

    const supabase = createAdminClient();

    // Get current max sort_order
    const { data: maxRow } = await supabase
      .from("videos")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const sort_order = (maxRow?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("videos")
      .insert([
        {
          video_id,
          title: (title ?? "").trim() || null,
          thumbnail,
          maxres_thumbnail,
          is_active: true,
          sort_order,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Videos POST]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ video: data }, { status: 201 });
  } catch (err) {
    console.error("[Videos POST] Unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH — toggle active or update title/sort_order ──────────────────────────
export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { id, is_active, title, sort_order } = body;

    if (!id) {
      return NextResponse.json({ error: "Video ID is required." }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof is_active === "boolean") updates.is_active = is_active;
    if (typeof title === "string") updates.title = title;
    if (typeof sort_order === "number") updates.sort_order = sort_order;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("videos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Videos PATCH]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ video: data });
  } catch (err) {
    console.error("[Videos PATCH] Unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE — remove a video permanently ───────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Video ID is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("videos").delete().eq("id", id);

    if (error) {
      console.error("[Videos DELETE]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Videos DELETE] Unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
