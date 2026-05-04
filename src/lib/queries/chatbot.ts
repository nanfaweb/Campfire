// ── Chatbot queries (server-side only) ───────────────────────────────────────
import { createClient } from "@/utils/supabase/server";
import type { ChatbotSession, ChatbotMessage } from "@/types/database";

/**
 * Fetch all chatbot sessions for a user, newest first.
 */
export async function getChatbotSessions(
  userId: string
): Promise<ChatbotSession[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("chatbot_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getChatbotSessions] error:", error.message);
      return [];
    }

    return (data ?? []) as ChatbotSession[];
  } catch (err) {
    console.error("[getChatbotSessions] unexpected error:", err);
    return [];
  }
}

/**
 * Fetch all messages for a given chatbot session, ordered chronologically.
 */
export async function getChatbotMessages(
  sessionId: string
): Promise<ChatbotMessage[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("chatbot_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getChatbotMessages] error:", error.message);
      return [];
    }

    return (data ?? []) as ChatbotMessage[];
  } catch (err) {
    console.error("[getChatbotMessages] unexpected error:", err);
    return [];
  }
}

/**
 * Get or create the most recent session for a user.
 * Used on the Marshmallow page to ensure there's always an active session.
 */
export async function getOrCreateSession(
  userId: string
): Promise<ChatbotSession | null> {
  const sessions = await getChatbotSessions(userId);

  if (sessions.length > 0) return sessions[0];

  // Create a new session
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chatbot_sessions")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("[getOrCreateSession] error:", error.message);
    return null;
  }

  return data as ChatbotSession;
}
