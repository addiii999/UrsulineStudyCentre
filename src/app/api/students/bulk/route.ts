import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

const MAX_BULK = 5;

// POST /api/students/bulk
// Actions: bulk_restore | bulk_schedule_delete | bulk_restore_from_queue
export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No records selected." }, { status: 400 });
    }
    if (ids.length > MAX_BULK) {
      return NextResponse.json(
        { error: `You can manage up to ${MAX_BULK} records at once for safety reasons.` },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // ── BULK RESTORE ─────────────────────────────────────────────
    if (action === "bulk_restore") {
      const { error } = await adminClient
        .from("students")
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          updated_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) throw error;

      // Audit each
      try {
        const { logAudit } = await import("@/lib/audit");
        for (const id of ids) {
          await logAudit({ action: "restore", table_name: "students", item_id: id, item_label: "Bulk Restore" });
        }
      } catch { /* non-critical */ }

      return NextResponse.json({ success: true, restored: ids.length });
    }

    // ── BULK SCHEDULE DELETE (30-day queue) ──────────────────────
    if (action === "bulk_schedule_delete") {
      // Fetch student details first
      const { data: students, error: fetchErr } = await adminClient
        .from("students")
        .select("id, full_name, present_phone, present_class")
        .in("id", ids);

      if (fetchErr) throw fetchErr;

      const scheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Insert into deletion_queue
      const queueRows = (students || []).map(s => ({
        student_id:           s.id,
        student_name:         s.full_name,
        student_phone:        s.present_phone,
        student_class:        s.present_class,
        deleted_by:           "admin",
        deletion_requested_at: new Date().toISOString(),
        scheduled_deletion_at: scheduledAt,
        is_purged:            false,
      }));

      if (queueRows.length > 0) {
        const { error: queueErr } = await adminClient.from("deletion_queue").insert(queueRows);
        if (queueErr) throw queueErr;
      }

      // Mark students as isolated (keep is_deleted=true, add queue marker)
      await adminClient
        .from("students")
        .update({ updated_at: new Date().toISOString() })
        .in("id", ids);

      // Audit
      try {
        const { logAudit } = await import("@/lib/audit");
        for (const id of ids) {
          await logAudit({
            action: "soft_delete",
            table_name: "students",
            item_id: id,
            item_label: `Scheduled for permanent deletion on ${new Date(scheduledAt).toLocaleDateString()}`,
          });
        }
      } catch { /* non-critical */ }

      return NextResponse.json({ success: true, scheduled: ids.length, purge_date: scheduledAt });
    }

    // ── RESTORE FROM DELETION QUEUE ──────────────────────────────
    if (action === "restore_from_queue") {
      // ids here are deletion_queue IDs
      const { data: queueItems, error: queueFetchErr } = await adminClient
        .from("deletion_queue")
        .select("id, student_id")
        .in("id", ids)
        .eq("is_purged", false);

      if (queueFetchErr) throw queueFetchErr;

      if (!queueItems || queueItems.length === 0) {
        return NextResponse.json({ error: "No valid queue items found." }, { status: 404 });
      }

      const studentIds = queueItems.map(q => q.student_id);

      // Restore students
      const { error: restoreErr } = await adminClient
        .from("students")
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          updated_at: new Date().toISOString(),
        })
        .in("id", studentIds);

      if (restoreErr) throw restoreErr;

      // Remove from deletion queue
      await adminClient.from("deletion_queue").delete().in("id", ids);

      try {
        const { logAudit } = await import("@/lib/audit");
        for (const sid of studentIds) {
          await logAudit({ action: "restore", table_name: "students", item_id: sid, item_label: "Restored from Deletion Queue" });
        }
      } catch { /* non-critical */ }

      return NextResponse.json({ success: true, restored: studentIds.length });
    }

    // ── EXECUTE PURGE (for auto-cleanup) ─────────────────────────
    if (action === "execute_purge") {
      // Find all expired, unpurged items in deletion_queue
      const { data: expired, error: expiredErr } = await adminClient
        .from("deletion_queue")
        .select("id, student_id")
        .lte("scheduled_deletion_at", new Date().toISOString())
        .eq("is_purged", false);

      if (expiredErr) throw expiredErr;

      if (!expired || expired.length === 0) {
        return NextResponse.json({ success: true, purged: 0, message: "No records to purge." });
      }

      const studentIds = expired.map(e => e.student_id);

      // Permanently delete students
      await adminClient.from("students").delete().in("id", studentIds);

      // Mark queue items as purged
      await adminClient
        .from("deletion_queue")
        .update({ is_purged: true, purged_at: new Date().toISOString() })
        .in("id", expired.map(e => e.id));

      return NextResponse.json({ success: true, purged: studentIds.length });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });

  } catch (err: unknown) {
    console.error("[students/bulk] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/students/bulk — fetch deletion queue
export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("deletion_queue")
      .select("*")
      .eq("is_purged", false)
      .order("deletion_requested_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ queue: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
