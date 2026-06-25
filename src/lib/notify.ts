/**
 * notify.ts — Server-side helper to insert admin notifications.
 * Call createNotification() from any API route after a meaningful action.
 * Fire-and-forget: never throws, so it never blocks the parent response.
 */

import { createAdminClient } from "@/lib/supabase";

export type NotificationType =
  | "enquiry"
  | "admission"
  | "faculty"
  | "course"
  | "video"
  | "gallery"
  | "result"
  | "announcement"
  | "system";

interface NotificationPayload {
  title:   string;
  message: string;
  type:    NotificationType;
}

/** Insert a notification row. Safe to call with .catch(() => {}) — never throws. */
export async function createNotification(payload: NotificationPayload): Promise<void> {
  try {
    const adminClient = createAdminClient();
    await adminClient.from("notifications").insert([
      {
        title:    payload.title,
        message:  payload.message,
        type:     payload.type,
        is_read:  false,
      },
    ]);
  } catch (err) {
    // Non-blocking: log silently
    console.error("[notify] Failed to create notification:", err);
  }
}

