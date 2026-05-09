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
    // Step 1: Get all relationships for the current user to determine status
    const { data: relations } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id, status")
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);

    const acceptedIds = new Set<string>([currentUserId]);
    const pendingIds = new Set<string>();

    (relations ?? []).forEach((f) => {
      if (f.status === "accepted") {
        acceptedIds.add(f.requester_id);
        acceptedIds.add(f.addressee_id);
      } else if (f.status === "pending" && f.requester_id === currentUserId) {
        // We only care about pending requests we SENT for the "Following" button state
        pendingIds.add(f.addressee_id);
      }
    });

    // Step 2: Fetch profiles not in the accepted set
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, is_public_profile")
      .not("id", "in", `(${Array.from(acceptedIds).join(",")})`)
      .eq("is_banned", false)
      .limit(limit);

    if (error) {
      console.error("[getFriendSuggestions] error:", error.message);
      return [];
    }

    // Step 3: Map to include initial follow status
    return (data || []).map(p => ({
      ...p,
      initial_status: pendingIds.has(p.id) ? "pending" : "none"
    })) as FriendSuggestion[];
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

/**
 * Check follow status between current user and target user.
 */
export async function getFollowStatus(currentUserId: string, targetUserId: string): Promise<"accepted" | "pending" | "none"> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("id, status")
    .eq("requester_id", currentUserId)
    .eq("addressee_id", targetUserId)
    .maybeSingle();

  if (error || !data) return "none";
  return data.status as "accepted" | "pending";
}

/**
 * Fetch pending follow requests for the current user.
 */
export async function getPendingRequests(userId: string): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("*, requester:profiles!requester_id(*)")
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPendingRequests] error:", error.message);
    return [];
  }
  return data || [];
}
export async function getFollowers(targetUserId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("requester:profiles!requester_id(*)")
    .eq("addressee_id", targetUserId)
    .eq("status", "accepted");

  if (error) return [];
  return (data ?? []).map((f) => f.requester as Profile);
}

/**
 * Fetch profiles of users the target user is following.
 */
export async function getFollowing(targetUserId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("addressee:profiles!addressee_id(*)")
    .eq("requester_id", targetUserId)
    .eq("status", "accepted");

  if (error) return [];
  return (data ?? []).map((f) => f.addressee as Profile);
}
