/**
 * audit.ts — Server-side helper to log admin actions.
 * Call logAudit() from any API route after a delete/restore/export.
 * Fire-and-forget: never throws, never blocks.
 */
import { createAdminClient } from "@/lib/supabase";

export type AuditAction =
  | "soft_delete"
  | "restore"
  | "permanent_delete"
  | "export"
  | "cleanup"
  | "failed_login"
  | "unauthorized_request"
  | "upload_failure"
  | "suspicious_activity"
  | "update"
  | "db_error";

interface AuditPayload {
  action:      AuditAction;
  table_name:  string;
  item_id?:    string;
  item_label?: string; // human-readable name
}

export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await adminClient.from("audit_logs").insert([{
      action:     payload.action,
      table_name: payload.table_name,
      item_id:    payload.item_id    ?? null,
      item_label: payload.item_label ?? null,
    }]);
  } catch (err) {
    // Non-blocking
    console.error("[audit] Failed to log:", err);
  }
}
