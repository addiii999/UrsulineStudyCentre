import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// Tables that support soft-delete
const SOFT_DELETE_TABLES = [
  "gallery",
  "faculty",
  "courses",
  "videos",
  "testimonials",
  "enquiries",
  "faqs",
] as const;

type SoftDeleteTable = (typeof SOFT_DELETE_TABLES)[number];

// Human-readable labels for each table
const TABLE_LABELS: Record<SoftDeleteTable, { singular: string; labelField: string }> = {
  gallery:      { singular: "Gallery Image",   labelField: "title"   },
  faculty:      { singular: "Faculty Member",  labelField: "name"    },
  courses:      { singular: "Course",          labelField: "name"    },
  videos:       { singular: "YouTube Video",   labelField: "title"   },
  testimonials: { singular: "Testimonial",     labelField: "name"    },
  enquiries:    { singular: "Enquiry",         labelField: "name"    },
  faqs:         { singular: "FAQ",             labelField: "q"       },
};

// ─── GET: All soft-deleted items across all tables ──────────
export async function GET(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const adminClient = createAdminClient();
    const results: {
      table: string;
      singular: string;
      id: string;
      label: string;
      deleted_at: string;
      storage_path?: string;
    }[] = [];

    for (const table of SOFT_DELETE_TABLES) {
      const { data } = await adminClient
        .from(table)
        .select("*")
        .eq("is_deleted", true)
        .order("deleted_at", { ascending: false });

      if (data) {
        const { singular, labelField } = TABLE_LABELS[table];
        for (const row of data) {
          results.push({
            table,
            singular,
            id:           row.id,
            label:        row[labelField] ?? `(no ${labelField})`,
            deleted_at:   row.deleted_at,
            storage_path: row.storage_path ?? undefined,
          });
        }
      }
    }

    // Sort all by deleted_at descending
    results.sort((a, b) =>
      new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
    );

    return NextResponse.json({ items: results });
  } catch (err: unknown) {
    console.error("Trash GET:", err);
    return NextResponse.json({ error: "Failed to fetch trash" }, { status: 500 });
  }
}

// ─── PATCH: Restore a soft-deleted item ─────────────────────
export async function PATCH(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, table, label } = await req.json();
    if (!id || !table) return NextResponse.json({ error: "id and table required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from(table)
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id);

    if (error) throw error;

    logAudit({ action: "restore", table_name: table, item_id: id, item_label: label }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Trash PATCH (restore):", err);
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}

// ─── DELETE: Permanently delete one item (DB + Storage) ─────
export async function DELETE(req: NextRequest) {
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, table, storage_path, label } = await req.json();
    if (!id || !table) return NextResponse.json({ error: "id and table required" }, { status: 400 });

    const adminClient = createAdminClient();

    // Remove from Supabase Storage first (if applicable)
    if (storage_path) {
      const { error: storageErr } = await adminClient.storage
        .from("faculty_photos")
        .remove([storage_path]);
      if (storageErr) console.warn("Storage remove warning:", storageErr.message);
    }

    // Hard delete from DB
    const { error } = await adminClient.from(table).delete().eq("id", id);
    if (error) throw error;

    logAudit({ action: "permanent_delete", table_name: table, item_id: id, item_label: label }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Trash DELETE (permanent):", err);
    return NextResponse.json({ error: "Permanent delete failed" }, { status: 500 });
  }
}
