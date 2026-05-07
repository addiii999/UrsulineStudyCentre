import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { checkAdminAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*");

    if (error) throw error;
    
    // Convert array of {key, value} to object
    const settingsObj = (data ?? []).reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return NextResponse.json({ settings: settingsObj }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const updates = await req.json(); // Expected format: { key1: "value1", key2: "value2" }
    const adminClient = createAdminClient();
    
    // Upsert each key-value pair
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "string") {
        const { error } = await adminClient
          .from("settings")
          .upsert({ key, value, updated_at: new Date().toISOString() });
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
