import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

type ExportTable =
  | "enquiries"
  | "faculty"
  | "courses"
  | "youtube_videos"
  | "gallery"
  | "faq"
  | "testimonials"
  | "students"
  | "notifications"
  | "results";

// Fields to exclude from export (sensitive/internal)
const EXCLUDE_FIELDS: Partial<Record<ExportTable, string[]>> = {
  students: [],
};

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape  = (v: unknown) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map(row => headers.map(h => escape(row[h])).join(",")),
  ].join("\n");
}

// ─── GET: Export table data as JSON or CSV ─────────────────
export async function GET(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const table  = (searchParams.get("table")  ?? "enquiries") as ExportTable;
    const format = (searchParams.get("format") ?? "json") as "json" | "csv";

    const validTables: ExportTable[] = [
      "enquiries", "faculty", "courses", "youtube_videos",
      "gallery", "faq", "testimonials", "students", "notifications", "results",
    ];
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const excluded = EXCLUDE_FIELDS[table] ?? [];
    const clean = (data ?? []).map(row => {
      const r = { ...row };
      for (const f of excluded) delete r[f];
      return r;
    });

    logAudit({ action: "export", table_name: table }).catch(() => {});

    if (format === "csv") {
      const csv = toCSV(clean as Record<string, unknown>[]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type":        "text/csv",
          "Content-Disposition": `attachment; filename="${table}_export_${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    // JSON
    const json = JSON.stringify({ table, exported_at: new Date().toISOString(), count: clean.length, data: clean }, null, 2);
    return new NextResponse(json, {
      headers: {
        "Content-Type":        "application/json",
        "Content-Disposition": `attachment; filename="${table}_backup_${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  } catch (err: unknown) {
    console.error("Backup GET:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

// ─── POST: Trigger cleanup — permanently delete 30-day-old trash ─
export async function POST(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tables = ["gallery", "faculty", "courses", "youtube_videos", "testimonials", "enquiries", "faq", "results"];
    const adminClient = createAdminClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let totalPurged = 0;
    for (const table of tables) {
      // First get storage_paths for files that need cleaning from Supabase Storage
      if (table === "gallery" || table === "faculty") {
        const { data: files } = await adminClient
          .from(table)
          .select("storage_path")
          .eq("is_deleted", true)
          .lt("deleted_at", thirtyDaysAgo);

        const paths = (files ?? []).map((f: { storage_path?: string }) => f.storage_path).filter(Boolean) as string[];
        if (paths.length > 0) {
          await adminClient.storage.from("faculty_photos").remove(paths);
        }
      }

      const { data: purged } = await adminClient
        .from(table)
        .delete()
        .eq("is_deleted", true)
        .lt("deleted_at", thirtyDaysAgo)
        .select("id");

      totalPurged += (purged ?? []).length;
    }

    logAudit({ action: "cleanup", table_name: "all", item_label: `Purged ${totalPurged} items` }).catch(() => {});
    return NextResponse.json({ success: true, purged: totalPurged });
  } catch (err: unknown) {
    console.error("Backup POST (purge):", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
