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
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file format. Only JPG, PNG, and WEBP are allowed." }, { status: 400 });
    }

    // 3. Process with Sharp
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Import sharp dynamically
    const sharp = (await import("sharp")).default;
    
    let sharpInstance = sharp(buffer);
    
    // Auto-rotate based on EXIF, strip metadata (Sharp strips by default)
    sharpInstance = sharpInstance.rotate();
    
    // Apply optimizations based on category
    if (folder === "faculty") {
      sharpInstance = sharpInstance.resize(600, 600, { fit: "cover", withoutEnlargement: true }).webp({ quality: 65, effort: 6 });
    } else if (folder === "gallery") {
      sharpInstance = sharpInstance.resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 70, effort: 6 });
    } else if (folder === "logos") {
      sharpInstance = sharpInstance.resize(300, 300, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80, effort: 6 });
    } else if (folder === "thumbnails") {
      sharpInstance = sharpInstance.resize(800, 450, { fit: "cover", withoutEnlargement: true }).webp({ quality: 65, effort: 6 });
    } else {
      sharpInstance = sharpInstance.resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 70, effort: 6 });
    }

    const optimizedBuffer = await sharpInstance.toBuffer();
    
    // Generate secure filename
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;

    // Upload using Supabase Admin Client
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from("faculty_photos") // Using general bucket name or change as needed
      .upload(fileName, optimizedBuffer, {
        contentType: "image/webp",
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
