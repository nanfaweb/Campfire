"use client";

import React, { useState } from "react";
import type { Notification } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { Avatar } from "@/components/Avatar";

interface NotificationsClientProps {
  initialNotifications: Notification[];
  initialRequests: any[];
  currentUserId: string;
}

export default function NotificationsClient({
  initialNotifications,
  initialRequests,
  currentUserId,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [requests, setRequests] = useState(initialRequests);
  const [busyRequests, setBusyRequests] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  // Real-time listener for new notifications and requests
  React.useEffect(() => {
    const channel = supabase
      .channel(`notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendships",
          filter: `addressee_id=eq.${currentUserId}`,
        },
        async (payload) => {
          // Fetch the requester's profile to show in the UI
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.requester_id)
            .single();
          
          if (data) {
            const newRequest = { ...payload.new, requester: data };
            setRequests((prev) => [newRequest, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

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

  const handleAcceptRequest = async (requestId: string) => {
    setBusyRequests(prev => ({ ...prev, [requestId]: true }));
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);
      
      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (e) {
      console.error("Failed to accept request", e);
      alert("Failed to accept request.");
    } finally {
      setBusyRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setBusyRequests(prev => ({ ...prev, [requestId]: true }));
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);
      
      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (e) {
      console.error("Failed to decline request", e);
      alert("Failed to decline request.");
    } finally {
      setBusyRequests(prev => ({ ...prev, [requestId]: false }));
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

          <div className="space-y-8">
            {/* Pending Requests Section */}
            {requests.length > 0 && (
              <section className="mb-12">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-6 px-1">
                  Pending Requests ({requests.length})
                </h3>
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div 
                      key={req.id}
                      className="bg-white border border-orange-100 rounded-[2rem] p-6 shadow-[0_10px_40px_-15px_rgba(255,107,43,0.1)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar src={req.requester.avatar_url} alt={req.requester.username} size={56} />
                        <div>
                          <p className="font-bold text-[#231a11]">{req.requester.display_name || req.requester.username}</p>
                          <p className="text-xs text-zinc-400">wants to join your campfire</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAcceptRequest(req.id)}
                          disabled={busyRequests[req.id]}
                          className="bg-orange-500 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleDeclineRequest(req.id)}
                          disabled={busyRequests[req.id]}
                          className="bg-zinc-50 text-zinc-500 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-zinc-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6 px-1">
                Recent Activity
              </h3>
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
        </section>
      </div>
        </div>
      </main>
    </div>
  );
}
