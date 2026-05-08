import { NextRequest, NextResponse } from "next/server";
import { supabase, createAdminClient } from "@/lib/supabase";

// Helper: get the student's phone stored in cookie session
function getStudentPhone(req: NextRequest): string | null {
  const cookie = req.cookies.get("student_phone")?.value;
  return cookie ?? null;
}

// GET — Fetch student profile (identified by session cookie)
export async function GET(req: NextRequest) {
  // For demo purposes, also allow ?phone= param as fallback
  const phone = getStudentPhone(req) ?? req.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, present_class, course, session, admission_status, present_phone, emergency_contact")
      .eq("present_phone", phone)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    return NextResponse.json({ student: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — Student updates only their safe editable fields
export async function PATCH(req: NextRequest) {
  const phone = getStudentPhone(req) ?? req.nextUrl.searchParams.get("phone");
  if (!phone) {
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

    // Get student id first
    const { data: student, error: findErr } = await adminClient
      .from("students")
      .select("id, full_name")
      .eq("present_phone", phone)
      .maybeSingle();

    if (findErr || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { error } = await adminClient
      .from("students")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", student.id);

    if (error) throw error;

    // Audit log
    const { logAudit } = await import("@/lib/audit");
    await logAudit({
      action: "update",
      table_name: "students",
      item_id: student.id,
      item_label: `${student.full_name} (self-update)`,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
