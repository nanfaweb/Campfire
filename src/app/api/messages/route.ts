// ── Messages API Route ───────────────────────────────────────────────────────
// POST  = send a new direct message
// PATCH = mark messages as read

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipient_id, content } = body;

    if (!recipient_id || typeof recipient_id !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid recipient_id" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    if (recipient_id === user.id) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("[messages POST] error:", error.message);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (err) {
    console.error("[messages POST] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sender_id } = body;

    if (!sender_id || typeof sender_id !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid sender_id" },
        { status: 400 }
      );
    }

    // Mark all unread messages from this sender as read
    const { error } = await supabase
      .from("messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .match({
        sender_id,
        recipient_id: user.id,
        is_read: false,
      });

    if (error) {
      console.error("[messages PATCH] error:", error.message);
      return NextResponse.json(
        { error: "Failed to mark as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Marked as read" }, { status: 200 });
  } catch (err) {
    console.error("[messages PATCH] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
