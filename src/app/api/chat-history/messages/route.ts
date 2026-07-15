import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const room_id = req.nextUrl.searchParams.get("room_id");

  if (!room_id) {
    return NextResponse.json({ error: "room_id is required" }, { status: 400 });
  }

  const { data: messages, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, room_id, student_nis, role, message, status, created_at")
    .eq("room_id", room_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [] });
}
