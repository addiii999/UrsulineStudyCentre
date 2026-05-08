import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST — Student login by phone number
// Returns student basic info if found, sets session cookie
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, present_phone, admission_status")
      .eq("present_phone", phone)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "No student record found with this phone number. Please contact the admin office." },
        { status: 404 }
      );
    }

    if (data.admission_status === "rejected") {
      return NextResponse.json(
        { error: "Your admission was not approved. Please contact the admin office." },
        { status: 403 }
      );
    }

    // Create session response with cookies
    const res = NextResponse.json({ success: true, student: { name: data.full_name } });
    res.cookies.set("student_session", "true", { path: "/", maxAge: 86400, sameSite: "lax" });
    res.cookies.set("student_phone", phone, { path: "/", maxAge: 86400, sameSite: "lax" });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
