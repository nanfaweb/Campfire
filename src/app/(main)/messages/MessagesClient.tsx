"use client";

// ── MessagesClient — Interactive Messages Component ────────────────────────

import React, { useState, useEffect } from "react";
import type { ConversationPreview, DirectMessage, Profile } from "@/types/database";
import { Avatar } from "@/components/Avatar";

interface MessagesClientProps {
  initialConversations: ConversationPreview[];
  currentUserId: string;
}

export default function MessagesClient({
  initialConversations,
  currentUserId,
}: MessagesClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeThreadUserId, setActiveThreadUserId] = useState<string | null>(
    initialConversations.length > 0 ? initialConversations[0].participant.id : null
  );
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (!activeThreadUserId) return;

    const fetchMessages = async () => {
      // For simplicity, we fetch via an API route or we could use the Supabase client directly
      // I'll use the Supabase client directly here for simplicity since it's a client component
      // and RLS handles security.
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${activeThreadUserId}),and(sender_id.eq.${activeThreadUserId},recipient_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data as DirectMessage[]);
      }

      // Mark as read via our API route
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: activeThreadUserId }),
      });

      // Update local unread count
      setConversations((prev) =>
        prev.map((c) =>
          c.participant.id === activeThreadUserId ? { ...c, unread_count: 0 } : c
        )
      );
    };

    fetchMessages();
  }, [activeThreadUserId, currentUserId]);

  const activeConversation = conversations.find(
    (c) => c.participant.id === activeThreadUserId
  );

  async function sendMessage() {
    if (!newMessage.trim() || !activeThreadUserId || isSending) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: activeThreadUserId,
          content: newMessage,
        }),
      });

      if (res.ok) {
        const { message } = await res.json();
        setMessages((prev) => [...prev, message as DirectMessage]);
        setNewMessage("");
        
        // Update conversation preview
        setConversations(prev => {
           const updated = [...prev];
           const idx = updated.findIndex(c => c.participant.id === activeThreadUserId);
           if (idx !== -1) {
             updated[idx].last_message = message;
             // Move to top
             const item = updated.splice(idx, 1)[0];
             updated.unshift(item);
           }
           return updated;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="ml-64 flex-1 h-screen flex flex-col overflow-hidden bg-white">
      {/* ── Page Header ── */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-orange-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <h2 className="font-h2 text-2xl text-primary text-[#843615] font-bold">
          Messages
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 text-lg text-zinc-400">
              search
            </span>
            <input
              className="bg-orange-50/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-orange-300 w-64 transition-all outline-none"
              placeholder="Search chats..."
              type="text"
            />
          </div>
        </div>
      </header>

      {/* ── Split View ── */}
      <div className="flex flex-grow overflow-hidden">
        {/* ── Conversation List ── */}
        <aside className="w-96 border-r border-orange-50 bg-white flex flex-col">
          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1 mt-4">
            {conversations.length === 0 ? (
              <p className="text-center text-zinc-400 mt-8 text-sm">
                No conversations yet.
              </p>
            ) : (
              conversations.map((c) => {
                const isActive = activeThreadUserId === c.participant.id;
                return (
                  <div
                    key={c.participant.id}
                    onClick={() => setActiveThreadUserId(c.participant.id)}
                    className={`flex items-center gap-4 p-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "bg-orange-50/50 border border-orange-100 shadow-sm"
                        : "hover:bg-zinc-50 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        src={c.participant.avatar_url}
                        alt={c.participant.username}
                        size={48}
                      />
                      {c.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-bold text-zinc-900 truncate font-[Space_Grotesk]">
                          {c.participant.display_name || c.participant.username}
                        </h4>
                        <span className="text-[10px] text-zinc-400 shrink-0 ml-2 uppercase font-bold">
                          {formatTime(c.last_message.created_at)}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          c.unread_count > 0
                            ? "text-[#843615] font-bold"
                            : "text-zinc-500"
                        }`}
                      >
                        {c.last_message.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Chat Window ── */}
        {activeConversation ? (
          <section className="flex-grow flex flex-col bg-[#FAFAFA]">
            {/* Chat header */}
            <header className="px-8 py-5 bg-white border-b border-orange-50 flex items-center justify-between shadow-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Avatar
                  src={activeConversation.participant.avatar_url}
                  alt={activeConversation.participant.username}
                  size={44}
                />
                <div>
                  <h3 className="font-black text-zinc-900 font-[Space_Grotesk] text-lg">
                    {activeConversation.participant.display_name ||
                      activeConversation.participant.username}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Online</p>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-4">
              {messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-5 shadow-sm leading-relaxed ${
                        isMine
                          ? "bg-[#843615] text-white rounded-[1.5rem] rounded-br-none"
                          : "bg-white border border-orange-100 text-zinc-800 rounded-[1.5rem] rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm md:text-base font-medium">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase mx-1">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input area */}
            <footer className="p-6 bg-white border-t border-orange-50">
              <div className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-grow relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="w-full bg-orange-50/30 border border-orange-100 rounded-3xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none max-h-48 transition-all"
                    placeholder="Write a cozy message..."
                    rows={1}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="w-12 h-12 bg-[#843615] text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#6b2c11] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </footer>
          </section>
        ) : (
          <section className="flex-grow flex items-center justify-center bg-[#FAFAFA]">
            <p className="text-zinc-400 font-medium">Select a conversation to start chatting</p>
          </section>
        )}
      </div>
    </main>
  );
}
