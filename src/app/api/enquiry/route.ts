import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo purposes (replace with Supabase in production)
const enquiries: Array<{
  id: string;
  name: string;
  phone: string;
  class: string;
  stream: string;
  message: string;
  status: string;
  created_at: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, class: cls, stream, message } = body;

    if (!name || !phone || !cls) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const enquiry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      class: cls,
      stream: stream || "",
      message: message || "",
      status: "new",
      created_at: new Date().toISOString(),
    };

    enquiries.push(enquiry);

    return NextResponse.json({ success: true, id: enquiry.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  // Admin only - in production, add auth middleware
  return NextResponse.json({ enquiries });
}
