import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Authentication
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`upload:${clientId}`, RATE_LIMITS.upload);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 4. Get file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Verify file type using magic numbers (not just MIME type)
    const fileType = await import("file-type");
    const detectedType = await fileType.fileTypeFromBuffer(buffer);
    
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!detectedType || !validTypes.includes(detectedType.mime)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // 6. Process with Sharp
    const sharp = (await import("sharp")).default;
    
    let sharpInstance = sharp(buffer);
    
    // Auto-rotate based on EXIF, strip metadata
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
    
    // 7. Generate secure filename with hash
    const crypto = await import("crypto");
    const hash = crypto.createHash("sha256").update(optimizedBuffer).digest("hex").substring(0, 16);
    const fileName = `${folder}/${Date.now()}-${hash}.webp`;

    // 8. Upload using Supabase Admin Client
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from("faculty_photos")
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

    // 9. Get Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from("faculty_photos")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, path: fileName });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
