import { createClient } from "@/utils/supabase/server";
import type { Story } from "@/types/database";

/**
 * Fetch all active stories from friends of the current user.
 */
export async function getActiveStories(currentUserId: string): Promise<Story[]> {
  const supabase = await createClient();

  try {
    // 1. Get IDs of people the current user follows (accepted only)
    const { data: following } = await supabase
      .from("friendships")
      .select("addressee_id")
      .eq("status", "accepted")
      .eq("requester_id", currentUserId);

    const followingIds = (following ?? []).map(f => f.addressee_id);

    // 2. Fetch stories from self and friends that haven't expired
    const { data, error } = await supabase
      .from("stories")
      .select("*, author:profiles(*)")
      .in("author_id", [currentUserId, ...followingIds])
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getActiveStories] error:", error.message);
      return [];
    }

    return data as Story[];
  } catch (err) {
    console.error("[getActiveStories] unexpected error:", err);
    return [];
  }
}

/**
 * Fetch active stories for a single user.
 */
export async function getUserStories(userId: string): Promise<Story[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("*, author:profiles(*)")
    .eq("author_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true });

  if (error) return [];
  return data as Story[];
}
