import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendAdminNotification } from "@/lib/sendEmail";
import { createNotification } from "@/lib/notify";
import { checkAdminAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, class: cls, stream, message } = body;

    if (!name?.trim() || !phone?.trim() || !cls?.trim()) {
      return NextResponse.json({ error: "Name, phone, and class are required." }, { status: 400 });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return NextResponse.json({ error: "Please enter a valid 10-digit phone number." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("enquiries")
      .insert([{
        name: name.trim(),
        phone: phone.trim(),
        class: cls.trim(),
        stream: (stream || "").trim(),
        message: (message || "").trim(),
        status: "new",
        is_deleted: false,
      }])
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Insert error:", error.message, error.details);
      return NextResponse.json({ error: "Failed to save enquiry. Please try again." }, { status: 500 });
    }

    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short",
    });

    createNotification({
      title: "New Admission Enquiry",
      message: `${name.trim()} (${cls.trim()}${stream ? " – " + stream : ""}) submitted an enquiry.`,
      type: "enquiry",
    }).catch(() => {});

    sendAdminNotification({
      name: name.trim(), phone: phone.trim(), studentClass: cls.trim(),
      stream: (stream || "").trim(), message: (message || "").trim(), submittedAt,
    }).catch((emailErr) => {
      console.error("[Email] Failed to send notification:", emailErr.message);
    });

    return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
  } catch (err) {
    console.error("[API] Internal error:", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const trashed = searchParams.get("trashed") === "true";
    const adminClient = createAdminClient();
    
    let query = adminClient
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (trashed) {
      query = query.eq("is_deleted", true);
    } else {
      query = query.eq("is_deleted", false);
    }

    const { data, error } = await query;

    if (error && error.code === "42703") {
      // Fallback if migration not run yet
      let fallbackQuery = adminClient.from("enquiries").select("*").order("created_at", { ascending: false });
      if (!trashed) {
         fallbackQuery = fallbackQuery.neq("status", "trash");
      }
      const { data: fbData, error: fbErr } = await fallbackQuery;
      if (fbErr) throw fbErr;
      return NextResponse.json({ enquiries: fbData ?? [], migrationNeeded: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    if (error) {
      console.error("[Supabase] Fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ enquiries: data ?? [] }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err) {
    console.error("[API] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
