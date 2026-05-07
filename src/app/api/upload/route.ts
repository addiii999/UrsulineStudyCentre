import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Authentication
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Validate File Type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file format. Only JPG, PNG, and WEBP are allowed." }, { status: 400 });
    }

    // 3. Validate File Size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 400 });
    }

    // 4. Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const secureExtension = mimeToExt[file.type] || "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${secureExtension}`;

    // Upload using Supabase Admin Client (Service Role Key)
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from("faculty_photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      const { logAudit } = await import("@/lib/audit");
      await logAudit({ action: "upload_failure", table_name: "storage", item_label: error.message });
      return NextResponse.json({ error: "Failed to upload image to storage" }, { status: 500 });
    }

    // 5. Get Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from("faculty_photos")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, path: fileName });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
