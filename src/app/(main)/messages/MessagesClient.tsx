"use client";

// ── MessagesClient — Interactive Messages Component ────────────────────────

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ConversationPreview, DirectMessage, Profile } from "@/types/database";
import { Avatar } from "@/components/Avatar";
import { createClient } from "@/utils/supabase/client";

interface MessagesClientProps {
  initialConversations: ConversationPreview[];
  currentUserId: string;
}

export default function MessagesClient({
  initialConversations,
  currentUserId,
}: MessagesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const [conversations, setConversations] = useState(initialConversations);
  const [activeThreadUserId, setActiveThreadUserId] = useState<string | null>(
    userIdParam || (initialConversations.length > 0 ? initialConversations[0].participant.id : null)
  );
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempParticipant, setTempParticipant] = useState<Profile | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const conversationsRef = useRef(conversations);
  const activeThreadUserIdRef = useRef(activeThreadUserId);
  const supabase = useMemo(() => createClient(), []);

  // Keep refs in sync
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    activeThreadUserIdRef.current = activeThreadUserId;
  }, [activeThreadUserId]);

  // Sync state with props
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Handle userId param and temp participants
  useEffect(() => {
    if (userIdParam) {
      setActiveThreadUserId(userIdParam);
      const exists = conversations.some(c => c.participant.id === userIdParam);
      if (!exists && !tempParticipant) {
        // Fetch profile for the new chat
        const fetchProfile = async () => {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userIdParam)
            .single();
          if (data) setTempParticipant(data as Profile);
        };
        fetchProfile();
      }
    }
  }, [userIdParam, conversations, tempParticipant, supabase]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (!activeThreadUserId) return;

    const fetchMessages = async () => {
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
  }, [activeThreadUserId, currentUserId, supabase]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages-user-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMsg = payload.new as DirectMessage;
          
          if (newMsg.sender_id === currentUserId || newMsg.recipient_id === currentUserId) {
            const otherId = newMsg.sender_id === currentUserId ? newMsg.recipient_id : newMsg.sender_id;
            
            // Update messages if it belongs to the currently active thread (using ref)
            if (otherId === activeThreadUserIdRef.current) {
              setMessages((prev) => {
                // Prevent duplicates
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              
              if (newMsg.recipient_id === currentUserId) {
                await fetch("/api/messages", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sender_id: otherId }),
                });
              }
            }

            // Update conversation list sidebar
            const exists = conversationsRef.current.some((c) => c.participant.id === otherId);
            if (!exists) {
              router.refresh();
            } else {
              setConversations((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((c) => c.participant.id === otherId);
                if (idx !== -1) {
                  const thread = { ...updated[idx] };
                  thread.last_message = newMsg;
                  if (newMsg.recipient_id === currentUserId && otherId !== activeThreadUserIdRef.current) {
                    thread.unread_count += 1;
                  }
                  updated.splice(idx, 1);
                  updated.unshift(thread);
                }
                return updated;
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedMsg = payload.new as DirectMessage;
          if (updatedMsg.recipient_id === currentUserId && updatedMsg.is_read) {
             setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscribed for user:', currentUserId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase, router]); // Removed activeThreadUserId dependency

  const activeConversation = conversations.find(
    (c) => c.participant.id === activeThreadUserId
  );

  const participant = activeConversation?.participant || tempParticipant;

  async function sendMessage(attachmentUrl?: string) {
    if ((!newMessage.trim() && !attachmentUrl) || !activeThreadUserId || isSending) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: activeThreadUserId,
          content: newMessage || (attachmentUrl ? "" : ""), // Allow empty content if attachment exists
          attachment_url: attachmentUrl,
        }),
      });

      if (res.ok) {
        setNewMessage("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeThreadUserId) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("message-attachments")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("message-attachments")
        .getPublicUrl(filePath);

      await sendMessage(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        {activeThreadUserId && participant ? (
          <section className="flex-grow flex flex-col bg-[#FAFAFA]">
            {/* Chat header */}
            <header className="px-8 py-5 bg-white border-b border-orange-50 flex items-center justify-between shadow-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Avatar
                  src={participant.avatar_url}
                  alt={participant.username}
                  size={44}
                />
                <div>
                  <h3 className="font-black text-zinc-900 font-[Space_Grotesk] text-lg">
                    {participant.display_name ||
                      participant.username}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Online</p>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-4"
            >
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
                      {msg.attachment_url && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          {msg.attachment_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                            <video 
                              src={msg.attachment_url} 
                              controls 
                              className="max-w-full rounded-lg shadow-inner"
                            />
                          ) : (
                            <img 
                              src={msg.attachment_url} 
                              alt="Attachment" 
                              className="max-w-full rounded-lg shadow-inner"
                              loading="lazy"
                            />
                          )}
                        </div>
                      )}
                      {msg.content && (
                        <p className="text-sm md:text-base font-medium whitespace-pre-wrap">{msg.content}</p>
                      )}
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*,video/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSending}
                  className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all active:scale-90 disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl">add_circle</span>
                  )}
                </button>
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
                  onClick={() => sendMessage()}
                  disabled={isSending || isUploading || (!newMessage.trim())}
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
