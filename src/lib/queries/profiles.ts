// ── Profile queries (server-side only) ───────────────────────────────────────
import { createClient } from "@/utils/supabase/server";
import type { Profile, FriendSuggestion } from "@/types/database";

/**
 * Fetch the currently authenticated user's profile.
 * Returns null if no session or profile found.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("[getCurrentProfile] error:", error.message);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error("[getCurrentProfile] unexpected error:", err);
    return null;
  }
}

/**
 * Fetch a profile by their unique username.
 * Returns null if not found.
 */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      console.error("[getProfileByUsername] error:", error.message);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error("[getProfileByUsername] unexpected error:", err);
    return null;
  }
}

/**
 * Fetch friend suggestions — profiles not yet connected to the current user.
 * Excludes existing friendships (any status).
 */
export async function getFriendSuggestions(
  currentUserId: string,
  limit = 5
): Promise<FriendSuggestion[]> {
  const supabase = await createClient();

  try {
    // Step 1: Get all user IDs already in a friendship with the current user
    const { data: existing } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(
        `requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`
      );

    const connectedIds = new Set<string>([currentUserId]);
    (existing ?? []).forEach((f) => {
      connectedIds.add(f.requester_id);
      connectedIds.add(f.addressee_id);
    });

    // Step 2: Fetch profiles not in the connected set
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .not("id", "in", `(${Array.from(connectedIds).join(",")})`)
      .eq("is_banned", false)
      .limit(limit);

    if (error) {
      console.error("[getFriendSuggestions] error:", error.message);
      return [];
    }

    return (data ?? []).map((p) => ({
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      bio: p.bio,
    }));
  } catch (err) {
    console.error("[getFriendSuggestions] unexpected error:", err);
    return [];
  }
}

/**
 * Fetch recommended users for the Explore page.
 * Returns profiles with a public presence, excluding current user & friends.
 */
export async function getRecommendedUsers(
  currentUserId: string,
  limit = 6
): Promise<FriendSuggestion[]> {
  return getFriendSuggestions(currentUserId, limit);
}

/**
 * Fetch accepted friends for the current user to display in the Stories bar.
 */
export async function getFriends(currentUserId: string): Promise<Profile[]> {
  const supabase = await createClient();

  try {
    const { data: friendships, error } = await supabase
      .from("friendships")
      .select("*, requester:profiles!requester_id(*), addressee:profiles!addressee_id(*)")
      .eq("status", "accepted")
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

    if (error) {
      console.error("[getFriends] error:", error.message);
      return [];
    }

    return (friendships || []).map((f) => {
      if (f.requester_id === currentUserId) {
        return f.addressee as Profile;
      }
      return f.requester as Profile;
    });
  } catch (err) {
    console.error("[getFriends] unexpected error:", err);
    return [];
  }
}
