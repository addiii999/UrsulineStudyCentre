import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// POST — Student login by phone number and password
export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch student data. 
    // We try to fetch password_hash. If migration hasn't run, it might fail.
    // So we fetch safely by catching column errors.
    let studentData;
    let { data, error } = await adminClient
      .from("students")
      .select("id, full_name, present_phone, admission_status, dob, password_hash")
      .eq("present_phone", phone)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error && error.code === "42703") {
      // password_hash column doesn't exist yet, fallback fetch
      const fallback = await adminClient
        .from("students")
        .select("id, full_name, present_phone, admission_status, dob")
        .eq("present_phone", phone)
        .eq("is_deleted", false)
        .maybeSingle();
      data = fallback.data as any;
      error = fallback.error;
    }

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "No student record found with this phone number." },
        { status: 404 }
      );
    }

    if (data.admission_status === "rejected") {
      return NextResponse.json(
        { error: "Your admission was not approved. Please contact the admin office." },
        { status: 403 }
      );
    }

    // AUTHENTICATION LOGIC
    let isAuthenticated = false;

    if (data.password_hash) {
      // Normal flow: verify bcrypt hash
      isAuthenticated = await bcrypt.compare(password, data.password_hash);
    } else {
      // Migration flow: No password_hash set yet. Verify against DOB.
      // DOB format from Supabase is usually YYYY-MM-DD
      const dobString = data.dob ? new Date(data.dob).toISOString().split("T")[0] : null;
      
      if (dobString && password === dobString) {
        isAuthenticated = true;
        // Auto-hash and save for future logins
        const newHash = await bcrypt.hash(password, 10);
        try {
          await adminClient
            .from("students")
            .update({ password_hash: newHash })
            .eq("id", data.id);
        } catch (e) {
          // Ignore error if column doesn't exist
        }
      } else if (!dobString) {
         // Student has no DOB set in db, so they can't login via this fallback. Admin intervention required.
         return NextResponse.json({ error: "Account setup incomplete. Please contact admin." }, { status: 403 });
      }
    }

    if (!isAuthenticated) {
      // Simulate delay
      await new Promise(r => setTimeout(r, 500));
      return NextResponse.json({ error: "Invalid phone number or password." }, { status: 401 });
    }

    // Create JWT Session token
    const secretStr = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secretStr) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const secret = new TextEncoder().encode(secretStr);
    const token = await new SignJWT({ role: "student", id: data.id, phone: data.present_phone })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    // Create session response with secure cookies
    const res = NextResponse.json({ success: true, student: { name: data.full_name } });
    
    // Set secure JWT cookie
    res.cookies.set("student_session", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      path: "/", 
      maxAge: 86400, 
      sameSite: "strict" 
    });
    
    // We can keep the phone cookie for client-side convenience, but it's not used for auth anymore
    res.cookies.set("student_phone", phone, { path: "/", maxAge: 86400, sameSite: "lax" });

    return res;
  } catch (err: any) {
    console.error("Student login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
