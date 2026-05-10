"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { ingestToLocal, deleteFromLocal } from "@/lib/marshmallow-sync";

export default function MarshmallowSyncEngine() {
  const syncedIds = useRef<Set<string>>(new Set());
  const userIdRef = useRef<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const setup = async () => {
      // 1. Identify User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      userIdRef.current = user.id;
      
      // 2. Load cache from localStorage
      const cached = localStorage.getItem(`marshmallow_synced_${user.id}`);
      if (cached) {
        try {
          syncedIds.current = new Set(JSON.parse(cached));
        } catch (e) {
          console.error("[marshmallow-sync] Cache parse error", e);
        }
      }

      console.log("[marshmallow-sync] Background listener active for user:", user.id);

      // 3. Monitor Real-time Events (Strictly "Just happened rn")
      const channel = supabase
        .channel('marshmallow-events')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'posts' },
          async (payload) => {
            const uid = userIdRef.current;
            if (uid) await ingestToLocal(payload.new.content, "social_post", uid, payload.new.id, payload.new.updated_at);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'posts' },
          async (payload) => {
            const uid = userIdRef.current;
            if (uid) await ingestToLocal(payload.new.content, "social_post", uid, payload.new.id, payload.new.updated_at);
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          async (payload) => {
            const uid = userIdRef.current;
            const newRecord = payload.new;
            if (uid && (newRecord.sender_id === uid || newRecord.recipient_id === uid)) {
              await ingestToLocal(newRecord.content, "social_message", uid, newRecord.id, newRecord.created_at);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          async (payload) => {
            const uid = userIdRef.current;
            if (uid && payload.new.id === uid) {
              const profileText = `Profile: @${payload.new.username} (${payload.new.display_name}). Bio: ${payload.new.bio}`;
              await ingestToLocal(profileText, "profile", uid, payload.new.id, payload.new.updated_at);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public' }, // Global delete listener
          async (payload) => {
            const uid = userIdRef.current;
            if (uid && payload.old?.id) await deleteFromLocal(payload.old.id, uid);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setup();
    return () => {
      cleanup.then(cb => cb && cb());
    };
  }, [supabase]);

  return null; // Silent Operation
}
