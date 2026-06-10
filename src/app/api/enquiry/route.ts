import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendAdminNotification } from "@/lib/sendEmail";
import { createNotification } from "@/lib/notify";
import { checkAdminAuth } from "@/lib/auth";
import { enquirySchema, sanitizeText } from "@/lib/validation";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req);
  
  // Rate limiting: 3 enquiries per hour per IP
  const rateLimit = checkRateLimit(`enquiry:${clientId}`, RATE_LIMITS.enquiry);
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many enquiries submitted. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    
    // Validate and sanitize input
    const validation = enquirySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, phone, class: cls, stream, message } = validation.data;

    // Additional sanitization
    const sanitizedData = {
      name: sanitizeText(name, 100),
      phone: phone.trim(),
      class: sanitizeText(cls, 50),
      stream: stream ? sanitizeText(stream, 100) : "",
      message: message ? sanitizeText(message, 1000) : "",
    };

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("enquiries")
      .insert([{
        full_name: sanitizedData.name,
        phone: sanitizedData.phone,
        class: sanitizedData.class,
        stream: sanitizedData.stream,
        message: sanitizedData.message,
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
      message: `${sanitizedData.name} (${sanitizedData.class}${sanitizedData.stream ? " – " + sanitizedData.stream : ""}) submitted an enquiry.`,
      type: "enquiry",
    }).catch(() => {});

    sendAdminNotification({
      name: sanitizedData.name,
      phone: sanitizedData.phone,
      studentClass: sanitizedData.class,
      stream: sanitizedData.stream,
      message: sanitizedData.message,
      submittedAt,
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

    const mapped = (data ?? []).map((row: any) => ({
      ...row,
      name: row.full_name, // Map for frontend compatibility
    }));

    return NextResponse.json({ enquiries: mapped }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err) {
    console.error("[API] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
