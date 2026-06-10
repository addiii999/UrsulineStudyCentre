import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { logAudit } from "@/lib/audit";

// Allow this endpoint to be called by Vercel Cron
export async function GET(req: NextRequest) {
  // 1. Verify cron secret to ensure it's triggered by Vercel securely
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET not configured in environment variables");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[Cron] Unauthorized cron attempt from:", req.headers.get("x-forwarded-for"));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tables = ["gallery", "faculty", "courses", "youtube_videos", "testimonials", "enquiries", "faq", "results"];
    const adminClient = createAdminClient();
    
    // Calculate timestamp for 30 days ago
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let totalPurged = 0;
    
    for (const table of tables) {
      // If table contains files, purge the files from Supabase Storage first
      if (table === "gallery" || table === "faculty") {
        const { data: files } = await adminClient
          .from(table)
          .select("storage_path")
          .eq("is_deleted", true)
          .lt("deleted_at", thirtyDaysAgo);

        const paths = (files ?? []).map((f: { storage_path?: string }) => f.storage_path).filter(Boolean) as string[];
        
        if (paths.length > 0) {
          // Permanently remove files from bucket
          await adminClient.storage.from("faculty_photos").remove(paths);
        }
      }

      // Hard delete the old soft-deleted database rows
      const { data: purged } = await adminClient
        .from(table)
        .delete()
        .eq("is_deleted", true)
        .lt("deleted_at", thirtyDaysAgo)
        .select("id");

      totalPurged += (purged ?? []).length;
    }

    if (totalPurged > 0) {
      logAudit({ 
        action: "cleanup", 
        table_name: "all", 
        item_label: `Auto-cron purged ${totalPurged} expired items` 
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, purged: totalPurged });
  } catch (err: any) {
    console.error("Auto Cleanup Cron Error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
