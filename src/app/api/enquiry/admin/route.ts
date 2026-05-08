import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

// PATCH — Update enquiry status or notes
export async function PATCH(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, ...updates } = await req.json();
    const adminClient = createAdminClient();
    
    // Auto-create student record if marked as admitted
    if (updates.status === "admitted") {
      const { data: enquiry } = await adminClient.from("enquiries").select("*").eq("id", id).single();
      if (enquiry) {
        // Check if student already exists to prevent duplicate (by phone and name)
        const { data: existing } = await adminClient.from("students")
          .select("id")
          .eq("present_phone", enquiry.phone)
          .eq("full_name", enquiry.name)
          .single();

        if (!existing) {
          await adminClient.from("students").insert([{
            full_name: enquiry.name,
            present_phone: enquiry.phone,
            present_class: enquiry.class || "",
            course: enquiry.stream || "",
            admission_status: "enrolled",
            admin_notes: `Auto-generated from enquiry ${id}`,
          }]);
        } else {
          // Update existing student record to enrolled
          await adminClient.from("students").update({
            admission_status: "enrolled",
            admin_notes: `Synced from enquiry ${id}`,
            updated_at: new Date().toISOString()
          }).eq("id", existing.id);
        }
      }
    }

    const { error } = await adminClient
      .from("enquiries")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    logAudit({ action: "update", table_name: "enquiries", item_id: id }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — Remove enquiry
export async function DELETE(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("enquiries").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    logAudit({ action: "soft_delete", table_name: "enquiries", item_id: id }).catch(() => {});
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
