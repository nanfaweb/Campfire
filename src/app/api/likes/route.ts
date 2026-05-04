// ── Like toggle API Route ────────────────────────────────────────────────────
// POST = like a post, DELETE = unlike a post.
// Uses the authenticated user's ID from the session.

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
    const { post_id } = body;

    if (!post_id || typeof post_id !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid post_id" },
        { status: 400 }
      );
    }

    // Insert like — unique constraint prevents duplicates
    const { error } = await supabase
      .from("likes")
      .insert({ post_id, user_id: user.id });

    if (error) {
      // 23505 = unique_violation — already liked
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "Already liked" },
          { status: 200 }
        );
      }
      console.error("[likes POST] error:", error.message);
      return NextResponse.json(
        { error: "Failed to like post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Liked" }, { status: 201 });
  } catch (err) {
    console.error("[likes POST] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { post_id } = body;

    if (!post_id || typeof post_id !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid post_id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("likes")
      .delete()
      .match({ post_id, user_id: user.id });

    if (error) {
      console.error("[likes DELETE] error:", error.message);
      return NextResponse.json(
        { error: "Failed to unlike post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Unliked" }, { status: 200 });
  } catch (err) {
    console.error("[likes DELETE] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
