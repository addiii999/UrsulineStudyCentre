import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import JSZip from "jszip";

const BACKUP_TABLES = [
  "enquiries",
  "faculty",
  "courses",
  "videos",
  "gallery",
  "faqs",
  "testimonials",
  "students",
  "notifications",
  "settings"
];

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map(row => headers.map(h => escape(row[h])).join(",")),
  ].join("\n");
}

export async function GET(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const adminClient = createAdminClient();
    const zip = new JSZip();
    
    // Create folders inside ZIP
    const jsonFolder = zip.folder("JSON_Data");
    const csvFolder = zip.folder("CSV_Exports");
    const metadataFolder = zip.folder("Metadata");
    
    const manifest = {
      generated_at: new Date().toISOString(),
      generator: "USC Automated Backup System",
      tables_backed_up: [] as string[],
      total_records: 0
    };

    // Fetch all tables concurrently for performance
    const promises = BACKUP_TABLES.map(async (table) => {
      try {
        const { data, error } = await adminClient
          .from(table)
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error(`Error backing up table ${table}:`, error);
          return null;
        }

        const rows = data || [];
        
        // Add to JSON folder
        jsonFolder?.file(`${table}.json`, JSON.stringify(rows, null, 2));
        
        // Add to CSV folder
        csvFolder?.file(`${table}.csv`, toCSV(rows));

        manifest.tables_backed_up.push(table);
        manifest.total_records += rows.length;

        return { table, count: rows.length };
      } catch (err) {
        console.error(`Failed to fetch ${table}:`, err);
        return null;
      }
    });

    await Promise.all(promises);

    // Add manifest and timestamps
    metadataFolder?.file("manifest.json", JSON.stringify(manifest, null, 2));
    metadataFolder?.file("timestamp.txt", `Backup generated on: ${new Date().toUTCString()}`);

    // Generate zip buffer
    const zipBuffer = await zip.generateAsync({ 
      type: "arraybuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 } // Good balance of compression and speed
    });

    // Log the backup action
    await logAudit({ 
      action: "export", 
      table_name: "all",
      item_label: "Generated Full Weekly Backup ZIP"
    }).catch(() => {});

    // Return the downloadable zip
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="USC_Backup_${new Date().toISOString().slice(0, 10)}.zip"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (error) {
    console.error("Full Backup Error:", error);
    return NextResponse.json({ error: "Failed to generate comprehensive backup" }, { status: 500 });
  }
}
