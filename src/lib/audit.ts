/**
 * audit.ts — Server-side helper to log admin actions.
 */
import { createAdminClient } from "@/lib/supabase";

export type AuditAction =
  | "soft_delete"
  | "restore"
  | "permanent_delete"
  | "export"
  | "cleanup"
  | "login"
  | "failed_login"
  | "unauthorized_request"
  | "upload_failure"
  | "suspicious_activity"
  | "update"
  | "db_error"
  | "reset_password"
  | "approve"
  | "reject";

interface AuditPayload {
  action:      AuditAction;
  table_name:  string;
  item_id?:    string;
  item_label?: string;
  ip_address?: string;
}

export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await adminClient.from("audit_logs").insert([{
      action:     payload.action,
      table_name: payload.table_name,
      item_id:    payload.item_id    ?? null,
      item_label: payload.item_label ?? null,
      ip_address: payload.ip_address ?? null,
    }]);
  } catch (err) {
    console.error("[audit] Failed to log:", err);
  }
}
