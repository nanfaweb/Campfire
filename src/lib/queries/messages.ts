// ── Message queries (server-side only) ───────────────────────────────────────
import { createClient } from "@/utils/supabase/server";
import type { DirectMessage, ConversationPreview, Profile } from "@/types/database";

/**
 * Fetch the conversation list for the current user.
 * Groups messages by thread (pair of sender/recipient) and returns
 * the latest message + participant profile + unread count.
 */
export async function getConversations(
  currentUserId: string
): Promise<ConversationPreview[]> {
  const supabase = await createClient();

  try {
    // Fetch all messages involving the current user, newest first
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)")
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getConversations] error:", error.message);
      return [];
    }

    if (!messages || messages.length === 0) return [];

    // Group by the other participant
    const threadMap = new Map<string, {
      participant: Profile;
      last_message: DirectMessage;
      unread_count: number;
    }>();

    for (const msg of messages) {
      const otherId =
        msg.sender_id === currentUserId ? msg.recipient_id : msg.sender_id;

      if (!threadMap.has(otherId)) {
        const participant =
          msg.sender_id === currentUserId
            ? (msg.recipient as Profile)
            : (msg.sender as Profile);

        threadMap.set(otherId, {
          participant,
          last_message: msg as DirectMessage,
          unread_count: 0,
        });
      }

      // Count unread messages sent TO the current user
      if (msg.recipient_id === currentUserId && !msg.is_read) {
        const thread = threadMap.get(otherId)!;
        thread.unread_count++;
      }
    }

    return Array.from(threadMap.values());
  } catch (err) {
    console.error("[getConversations] unexpected error:", err);
    return [];
  }
}

/**
 * Fetch all messages in a specific thread between two users.
 */
export async function getThreadMessages(
  currentUserId: string,
  otherUserId: string
): Promise<DirectMessage[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getThreadMessages] error:", error.message);
      return [];
    }

    return (data ?? []) as DirectMessage[];
  } catch (err) {
    console.error("[getThreadMessages] unexpected error:", err);
    return [];
  }
}
