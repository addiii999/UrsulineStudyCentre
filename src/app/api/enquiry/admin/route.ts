import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";

// PATCH — Update enquiry status, approve admission, restore
export async function PATCH(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, action, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const adminClient = createAdminClient();

    // ── RESTORE from Trash ──────────────────────────────────────
    if (action === "restore") {
      const { error } = await adminClient
        .from("enquiries")
        .update({ is_deleted: false, deleted_at: null, status: "new", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error && error.code !== "42703") throw error;
      if (error?.code === "42703") {
        await adminClient.from("enquiries").update({ status: "new" }).eq("id", id);
      }

      logAudit({ action: "restore", table_name: "enquiries", item_id: id }).catch(() => {});
      return NextResponse.json({ success: true });
    }

    // ── APPROVE ADMISSION ──────────────────────────────────────
    // When admin approves, automatically create/update student record and enroll them
    if (action === "approve" || updates.status === "enrolled") {
      const { data: enquiry, error: fetchErr } = await adminClient
        .from("enquiries")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchErr || !enquiry) {
        return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
      }

      // Check for existing student by phone to avoid duplicates
      const { data: existingStudent } = await adminClient
        .from("students")
        .select("id, admission_status")
        .eq("present_phone", enquiry.phone)
        .maybeSingle();

      if (existingStudent) {
        // Update existing student to enrolled
        const { error: updateErr } = await adminClient
          .from("students")
          .update({
            admission_status: "enrolled",
            admin_notes: `Approved from enquiry ${id}. Enrolled on ${new Date().toLocaleDateString("en-IN")}.`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingStudent.id);

        if (updateErr) throw updateErr;
      } else {
        // Create new student record from enquiry data
        const newStudentPayload: any = {
          full_name: enquiry.full_name,
          present_phone: enquiry.phone,
          present_class: enquiry.class || "",
          course: enquiry.stream || "",
          admission_status: "enrolled",
          is_deleted: false,
          admin_notes: `Created from enquiry ${id}. Enrolled on ${new Date().toLocaleDateString("en-IN")}.`,
          session: "2026-27",
        };

        const { error: insertErr } = await adminClient.from("students").insert([newStudentPayload]);

        // If is_deleted column missing, try without it
        if (insertErr && insertErr.code === "42703") {
          delete newStudentPayload.is_deleted;
          const { error: fallbackErr } = await adminClient.from("students").insert([newStudentPayload]);
          if (fallbackErr) throw fallbackErr;
        } else if (insertErr) {
          throw insertErr;
        }
      }

      // Mark the enquiry as enrolled/converted
      const { error: enquiryUpdateErr } = await adminClient
        .from("enquiries")
        .update({ status: "enrolled", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (enquiryUpdateErr) throw enquiryUpdateErr;

      // Fire admin notification
      createNotification({
        title: "Student Approved",
        message: `${enquiry.full_name} has been approved and added to Student Records.`,
        type: "enquiry",
      }).catch(() => {});

      logAudit({ action: "update", table_name: "enquiries", item_id: id, item_label: `Approved: ${enquiry.full_name}` }).catch(() => {});
      return NextResponse.json({ success: true, message: "Student approved and added to records." });
    }

    // ── GENERIC STATUS UPDATE ──────────────────────────────────
    const { error } = await adminClient
      .from("enquiries")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    logAudit({ action: "update", table_name: "enquiries", item_id: id }).catch(() => {});
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Enquiry PATCH error:", err);
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
      const { error } = await adminClient.from("enquiries").delete().eq("id", id);
      if (error) throw error;
      logAudit({ action: "permanent_delete", table_name: "enquiries", item_id: id }).catch(() => {});
      return NextResponse.json({ success: true, deleted: "permanent" });
    } else {
      // Soft Delete (Trash)
      const { error } = await adminClient
        .from("enquiries")
        .update({ is_deleted: true, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        if (error.code === "42703") {
          // Migration not run yet — fallback to status
          const { error: fbErr } = await adminClient.from("enquiries").update({ status: "trash" }).eq("id", id);
          if (fbErr) throw fbErr;
        } else {
          throw error;
        }
      }

      logAudit({ action: "soft_delete", table_name: "enquiries", item_id: id }).catch(() => {});
      return NextResponse.json({ success: true, deleted: "soft" });
    }
  } catch (err: any) {
    console.error("Enquiry DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
