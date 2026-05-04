// ── Notification queries (server-side only) ──────────────────────────────────
import { createClient } from "@/utils/supabase/server";
import type { Notification, Profile } from "@/types/database";

/**
 * Fetch notifications for the current user, resolving actor profiles
 * from the JSONB payload when available.
 */
export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[getNotifications] error:", error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Collect unique actor IDs from payload to batch-fetch profiles
    const actorIds = new Set<string>();
    for (const n of data) {
      const actorId = (n.payload as Record<string, unknown>)?.actor_id;
      if (typeof actorId === "string") actorIds.add(actorId);
    }

    // Batch fetch actor profiles
    let actorMap = new Map<string, Profile>();
    if (actorIds.size > 0) {
      const { data: actors } = await supabase
        .from("profiles")
        .select("*")
        .in("id", Array.from(actorIds));

      if (actors) {
        for (const a of actors) {
          actorMap.set(a.id, a as Profile);
        }
      }
    }

    // Attach actor profiles to notifications
    return data.map((n) => {
      const actorId = (n.payload as Record<string, unknown>)?.actor_id;
      return {
        ...n,
        actor:
          typeof actorId === "string" ? actorMap.get(actorId) ?? undefined : undefined,
      } as Notification;
    });
  } catch (err) {
    console.error("[getNotifications] unexpected error:", err);
    return [];
  }
}
