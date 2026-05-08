import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

// ─── GET: Storage stats — file counts, deleted items, audit ─
export async function GET(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const adminClient = createAdminClient();

    // 1. Supabase Storage — query storage.objects via RPC/SQL
    //    (service role can read storage.objects directly)
    // 1. Placeholder — storage_stats_view queried safely
    let storageObjects = null;
    try {
      const { data } = await adminClient
        .from("storage_stats_view")
        .select("*")
        .limit(1)
        .maybeSingle();
      storageObjects = data;
    } catch { /* view may not exist — that's fine */ }

    // 2. Count live items per table
    const tables = [
      { key: "students",     label: "Students",     emoji: "🎓" },
      { key: "gallery",      label: "Gallery",      emoji: "🖼️" },
      { key: "faculty",      label: "Faculty",      emoji: "👩‍🏫" },
      { key: "courses",      label: "Courses",      emoji: "📚" },
      { key: "videos",       label: "Videos",       emoji: "▶️" },
      { key: "testimonials", label: "Testimonials", emoji: "⭐" },
      { key: "enquiries",    label: "Enquiries",    emoji: "📩" },
      { key: "faqs",         label: "FAQs",         emoji: "❓" },
      { key: "notifications",label: "Notifications",emoji: "🔔" },
    ];

    const tableStats: {
      key: string;
      label: string;
      emoji: string;
      total: number;
      deleted: number;
      active: number;
    }[] = [];

    let totalDeleted = 0;

    for (const t of tables) {
      // Total count
      const { count: total } = await adminClient
        .from(t.key)
        .select("*", { count: "exact", head: true });

      // Deleted count (only for tables that have is_deleted)
      let deleted = 0;
      if (["students", "gallery", "faculty", "courses", "videos", "testimonials", "enquiries", "faqs"].includes(t.key)) {
        const { count } = await adminClient
          .from(t.key)
          .select("*", { count: "exact", head: true })
          .eq("is_deleted", true);
        deleted = count ?? 0;
        totalDeleted += deleted;
      }

      tableStats.push({
        ...t,
        total:  total   ?? 0,
        deleted,
        active: (total  ?? 0) - deleted,
      });
    }

    // 3. Storage bucket file count (faculty_photos bucket)
    //    Use listAll approach
    let storageFileCount = 0;
    let storageEstimatedKB = 0;

    try {
      const { data: bucketFiles } = await adminClient.storage
        .from("faculty_photos")
        .list("", { limit: 1000 });

      storageFileCount = bucketFiles?.length ?? 0;

      // Also count gallery subfolder
      const { data: galleryFiles } = await adminClient.storage
        .from("faculty_photos")
        .list("gallery", { limit: 1000 });

      storageFileCount += galleryFiles?.length ?? 0;
      // Rough estimate: gallery ~80KB avg, faculty ~50KB avg
      storageEstimatedKB = storageFileCount * 70;
    } catch {
      // Supabase free plan may not expose storage listing fully
      storageFileCount = tableStats.find(t => t.key === "gallery")?.active ?? 0;
    }

    // 4. Audit logs (last 20)
    const { data: auditLogs } = await adminClient
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    // 5. Items approaching auto-purge (deleted 25+ days ago)
    const twentyFiveDaysAgo = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString();
    const softDeleteTables = ["students", "gallery", "faculty", "courses", "videos", "testimonials", "enquiries", "faqs"];
    let expiringCount = 0;

    for (const table of softDeleteTables) {
      const { count } = await adminClient
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", true)
        .lt("deleted_at", twentyFiveDaysAgo);
      expiringCount += count ?? 0;
    }

    // Suppress unused variable warning
    void storageObjects;

    return NextResponse.json({
      tableStats,
      totalDeleted,
      expiringCount,
      storage: {
        fileCount:        storageFileCount,
        estimatedKB:      storageEstimatedKB,
        estimatedMB:      (storageEstimatedKB / 1024).toFixed(1),
        freePlanLimitMB:  1000,         // Supabase free: 1 GB storage
        usagePercent:     Math.min(100, ((storageEstimatedKB / 1024) / 1000) * 100).toFixed(2),
      },
      auditLogs: auditLogs ?? [],
    });
  } catch (err: unknown) {
    console.error("Storage stats GET:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
