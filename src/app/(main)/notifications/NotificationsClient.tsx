"use client";

import React, { useState } from "react";
import type { Notification } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { Avatar } from "@/components/Avatar";

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export default function NotificationsClient({
  initialNotifications,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const supabase = createClient();

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "post_liked":
        return { name: "local_fire_department", color: "text-[#FF6B2B]", bg: "bg-[#FF6B2B]" };
      case "post_commented":
        return { name: "chat_bubble", color: "text-[#FF3CAC]", bg: "bg-[#FF3CAC]" };
      case "friend_request":
        return { name: "person_add", color: "text-[#784BA0]", bg: "bg-[#784BA0]" };
      case "friend_accepted":
        return { name: "how_to_reg", color: "text-green-500", bg: "bg-green-500" };
      default:
        return { name: "notifications", color: "text-zinc-500", bg: "bg-zinc-500" };
    }
  };

  return (
    <div className="ml-64 flex-1 flex max-w-[1440px]">
      <main className="flex-1 mr-0 lg:mr-[340px] px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
            <h2 className="font-bold text-3xl text-zinc-900 mb-2 font-[Space_Grotesk]">
              Notifications
            </h2>
          </header>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-zinc-400 text-center py-8">
                No new notifications. You're all caught up!
              </p>
            ) : (
              notifications.map((notif) => {
                const icon = getIcon(notif.type);
                const dateStr = new Date(notif.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });
                
                // Parse message from payload or construct based on type
                let message = "You have a new notification";
                if (notif.payload && typeof notif.payload === "object") {
                   const payload = notif.payload as Record<string, string>;
                   if (payload.message) message = payload.message;
                   else if (notif.type === 'post_liked' && notif.actor) {
                       message = `${notif.actor.username} liked your post.`;
                   }
                }

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                    className={`rounded-xl p-4 flex items-start gap-4 transition-all cursor-pointer ${
                      notif.is_read
                        ? "bg-white border border-zinc-100 opacity-70"
                        : "bg-white border border-orange-100 shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)]"
                    }`}
                  >
                    <div className="relative shrink-0 mt-1">
                      <Avatar
                        src={notif.actor?.avatar_url}
                        alt={notif.actor?.username || "Actor"}
                        size={48}
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white ${icon.bg}`}
                      >
                        <span
                          className="material-symbols-outlined text-[12px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {icon.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-800 leading-relaxed">
                        {message}
                      </p>
                      <p className="text-xs text-zinc-400 font-bold uppercase mt-1">
                        {dateStr}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[#FF6B2B] mt-2 shrink-0"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
