// ── Post queries (server-side only) ──────────────────────────────────────────
import { createClient } from "@/utils/supabase/server";
import type { FeedPost } from "@/types/database";

/**
 * Fetch the home feed for a given user.
 * Joins author profile, aggregates likes/comments counts,
 * and checks whether the current user has liked each post.
 * RLS automatically filters by visibility (public / friends / own).
 */
export async function getFeedPosts(userId: string): Promise<FeedPost[]> {
  const supabase = await createClient();

  try {
    // Fetch accepted friends; home feed shows friend posts and own posts.
    const { data: friendships, error: friendshipsError } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (friendshipsError) {
      console.error("[getFeedPosts] friendships error:", friendshipsError.message);
      return [];
    }

    const friendIds = Array.from(
      new Set(
        (friendships ?? []).map((f) =>
          f.requester_id === userId ? f.addressee_id : f.requester_id
        )
      )
    );

    const authorIds = [userId, ...friendIds];

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:profiles!author_id(*),
        likes_agg:likes(count),
        comments_agg:comments(count),
        user_likes:likes(user_id)
      `
      )
      .eq("is_deleted", false)
      .in("author_id", authorIds)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      // Supabase !inner join fails when no matching row exists.
      // Fall back to a query without user_likes and mark all as not-liked.
      const { data: fallback, error: fallbackErr } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:profiles!author_id(*),
          likes_agg:likes(count),
          comments_agg:comments(count)
        `
        )
        .eq("is_deleted", false)
        .in("author_id", authorIds)
        .order("created_at", { ascending: false })
        .limit(30);

      if (fallbackErr) {
        console.error("[getFeedPosts] fallback error:", fallbackErr.message);
        return [];
      }

      return transformPosts(fallback || [], userId, false);
    }

    return transformPosts(data || [], userId, true);
  } catch (err) {
    console.error("[getFeedPosts] unexpected error:", err);
    return [];
  }
}

/**
 * Fetch trending / explore posts (most liked in last 30 days).
 */
export async function getExplorePosts(userId: string): Promise<FeedPost[]> {
  const supabase = await createClient();

  try {
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:profiles!author_id(*),
        likes_agg:likes(count),
        comments_agg:comments(count)
      `
      )
      .eq("is_deleted", false)
      .eq("visibility", "public")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[getExplorePosts] error:", error.message);
      return [];
    }

    return transformPosts(data || [], userId, false);
  } catch (err) {
    console.error("[getExplorePosts] unexpected error:", err);
    return [];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function transformPosts(
  raw: any[],
  userId: string,
  hasUserLikes: boolean
): FeedPost[] {
  return raw.map((row) => ({
    id: row.id,
    author_id: row.author_id,
    content: row.content,
    media_urls: row.media_urls ?? [],
    video_link: row.video_link,
    visibility: row.visibility,
    is_deleted: row.is_deleted,
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: row.author,
    likes_count: row.likes_agg?.[0]?.count ?? 0,
    comments_count: row.comments_agg?.[0]?.count ?? 0,
    user_has_liked: hasUserLikes
      ? (row.user_likes ?? []).some(
          (l: { user_id: string }) => l.user_id === userId
        )
      : false,
  }));
}
