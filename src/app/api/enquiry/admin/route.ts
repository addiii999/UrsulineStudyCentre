import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";

// PATCH — Update enquiry status or notes (and restore)
export async function PATCH(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, action, ...updates } = await req.json();
    const adminClient = createAdminClient();

    // Handle restore
    if (action === "restore") {
      const { error } = await adminClient
        .from("enquiries")
        .update({
          is_deleted: false,
          deleted_at: null,
          status: "new", // Reset status to new on restore to force review
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      
      if (error) {
        if (error.code === '42703') {
           // Fallback if no soft-delete columns
           await adminClient.from("enquiries").update({ status: "new" }).eq("id", id);
        } else { throw error; }
      }
      
      logAudit({ action: "restore", table_name: "enquiries", item_id: id }).catch(() => {});
      return NextResponse.json({ success: true });
    }
    
    // Auto-create student record if marked as admitted / enrolled
    if (updates.status === "enrolled" || updates.status === "admitted") {
      const { data: enquiry } = await adminClient.from("enquiries").select("*").eq("id", id).single();
      if (enquiry) {
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

// DELETE — Soft Delete or Permanent Delete
export async function DELETE(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();

    if (permanent) {
      // PERMANENT DELETE
      const { error } = await adminClient.from("enquiries").delete().eq("id", id);
      if (error) throw error;
      logAudit({ action: "permanent_delete", table_name: "enquiries", item_id: id }).catch(() => {});
      return NextResponse.json({ success: true, deleted: "permanent" });
    } else {
      // SOFT DELETE (Trash)
      const { error } = await adminClient
        .from("enquiries")
        .update({ is_deleted: true, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) {
        if (error.code === '42703') {
           // Fallback to setting status to 'trash' if columns missing
           const { error: fallbackErr } = await adminClient.from("enquiries").update({ status: "trash" }).eq("id", id);
           if (fallbackErr) throw new Error("Failed to move to trash: " + fallbackErr.message);
        } else { throw error; }
      }
      
      logAudit({ action: "soft_delete", table_name: "enquiries", item_id: id }).catch(() => {});
      return NextResponse.json({ success: true, deleted: "soft" });
    }
  } catch (err: any) {
    console.error("Enquiry DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
