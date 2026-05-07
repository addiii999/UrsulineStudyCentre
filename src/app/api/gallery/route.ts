import { logAudit } from "@/lib/audit";
import { NextResponse, NextRequest } from "next/server";
import { createAdminClient, supabase } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { createNotification } from "@/lib/notify";

// ─── GET: Public gallery fetch ────────────────────────────────
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*").eq("is_deleted", false)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err) {
    console.error("Gallery GET error:", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

// ─── POST: Upload + insert (admin only) ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    const title    = (formData.get("title") as string) || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type))
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, or GIF allowed." }, { status: 400 });

    // 5 MB hard cap (client should compress to ~100 KB, but guard server-side too)
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File exceeds 5 MB. Please compress before uploading." }, { status: 400 });

    // Upload to Supabase Storage ─────────────────────────────
    const adminClient = createAdminClient();
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif"
    };
    const secureExt = mimeToExt[file.type] || "jpg";
    const fileName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${secureExt}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error: storageErr } = await adminClient.storage
      .from("faculty_photos") // reuse existing public bucket
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (storageErr) {
      console.error("Storage error:", storageErr);
      await logAudit({ action: "upload_failure", table_name: "storage", item_label: storageErr.message });
      return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = adminClient.storage
      .from("faculty_photos")
      .getPublicUrl(fileName);

    // Insert DB record ──────────────────────────────────────
    const { data, error: dbErr } = await adminClient
      .from("gallery")
      .insert({ title, image_url: publicUrl, storage_path: fileName, is_active: true, sort_order: 0 })
      .select()
      .single();

    if (dbErr) {
      console.error("DB insert error:", dbErr);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    createNotification({
      title:   "Gallery Image Uploaded",
      message: `New photo "${title || "Untitled"}" was added to the campus gallery.`,
      type:    "gallery",
    }).catch(() => {});

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    console.error("Gallery POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH: toggle visibility or update title (admin only) ───
export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, is_active, title } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (typeof is_active === "boolean") updates.is_active = is_active;
    if (typeof title === "string")     updates.title      = title;

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("gallery")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
  } catch (err) {
    console.error("Gallery PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: remove from DB + storage (admin only) ──────────
export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, storage_path } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const adminClient = createAdminClient();

    // Remove from Supabase Storage first
    if (storage_path) {
      await adminClient.storage.from("faculty_photos").remove([storage_path]);
    }

    const { error } = await adminClient.from("gallery").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    logAudit({ action: "soft_delete", table_name: "gallery", item_id: id }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gallery DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
