import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { verifyStudentAuth } from "@/lib/studentAuth";

// GET — Fetch student profile (identified by secure session JWT)
export async function GET(req: NextRequest) {
  const session = await verifyStudentAuth(req);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated. Please log in again." }, { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    // Look up by ID (primary), fall back to email, then phone for backwards compat
    let query = adminClient
      .from("students")
      .select("id, full_name, email, present_class, course, session, admission_status, approval_status, present_phone, emergency_contact");

    if (session.id) {
      query = query.eq("id", session.id);
    } else if (session.email) {
      query = query.eq("email", session.email);
    } else if (session.phone) {
      query = query.eq("present_phone", session.phone);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Check if account is approved
    if (data.approval_status === "rejected") {
      return NextResponse.json({ error: "Account not approved" }, { status: 403 });
    }

    return NextResponse.json({ student: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH — Student updates only their safe editable fields
export async function PATCH(req: NextRequest) {
  const session = await verifyStudentAuth(req);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Strict whitelist — students can only update these fields
    const allowed = ["present_phone", "emergency_contact"];
    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("students")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", session.id);

    if (error) throw error;

    try {
      const { logAudit } = await import("@/lib/audit");
      await logAudit({
        action: "update",
        table_name: "students",
        item_id: session.id,
        item_label: "Student self-update",
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
