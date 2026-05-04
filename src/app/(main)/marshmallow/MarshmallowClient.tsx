"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/Icon";
import type { ChatbotMessage } from "@/types/database";

interface MarshmallowClientProps {
  sessionId: string;
  initialMessages: ChatbotMessage[];
}

export default function MarshmallowClient({
  sessionId,
  initialMessages,
}: MarshmallowClientProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userText = input.trim();
    setInput("");
    
    // Optimistic user message
    const tempUserMsg: ChatbotMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content: userText,
      source_post_ids: [],
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/marshmallow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText, session_id: sessionId }),
      });

      if (res.ok) {
        const { reply } = await res.json();
        const aiMsg: ChatbotMessage = {
          id: `temp-ai-${Date.now()}`,
          session_id: sessionId,
          role: "assistant",
          content: reply,
          source_post_ids: [],
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (e) {
      console.error(e);
      const errorMsg: ChatbotMessage = {
          id: `temp-err-${Date.now()}`,
          session_id: sessionId,
          role: "assistant",
          content: "Oops, my spark fizzled. Could you try asking that again?",
          source_post_ids: [],
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="ml-64 flex-1 h-screen flex flex-col relative bg-[#fff8f4]">
      {/* Progress bar motif */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-orange-50 overflow-hidden pointer-events-none z-20">
        <div className="h-full w-1/3 bg-gradient-to-r from-[#ff6b2b] to-[#ff3cac] rounded-full" />
      </div>

      {/* Chat Header */}
      <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-orange-100 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 ring-2 ring-[#802a00]/20 shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center">
              <Icon name="local_fire_department" fill={true} size={24} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="font-[Space_Grotesk] text-[24px] font-bold text-[#231a11]">
              Marshmallow AI
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#ff6b2b] rounded-full animate-pulse" />
              <span className="font-[Space_Grotesk] text-[12px] font-bold tracking-[0.05em] text-[#802a00] opacity-70 uppercase">
                Online &amp; Toasty
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Body */}
      <div className="flex-1 flex overflow-hidden">
        <section className="flex-1 overflow-y-auto chat-scroll px-8 py-10 space-y-8 bg-[#fff8f4]">
          {messages.length === 0 && (
             <div className="text-center text-zinc-400 mt-10">
                <Icon name="local_fire_department" size={48} className="mx-auto mb-4 text-orange-200" />
                <p>Say hello to Marshmallow!</p>
             </div>
          )}
          
          {messages.map((msg) =>
            msg.role === "assistant" ? (
              <div key={msg.id} className="flex items-start gap-4 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-[#ff6b2b]/10 flex items-center justify-center text-[#ff6b2b] shrink-0">
                  <Icon name="local_fire_department" fill={true} size={14} />
                </div>
                <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-orange-50/50">
                  <p className="text-[15px] leading-[1.6] text-[#231a11] whitespace-pre-wrap">{msg.content}</p>
                  <p className="mt-4 font-[Space_Grotesk] text-[10px] font-bold tracking-[0.05em] text-stone-400">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-start gap-4 max-w-3xl ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[#802a00]/10 flex items-center justify-center text-[#802a00] shrink-0">
                  <Icon name="person" size={14} />
                </div>
                <div className="bg-[#802a00] p-6 rounded-2xl rounded-tr-none shadow-md text-white">
                  <p className="text-[15px] leading-[1.6] whitespace-pre-wrap">{msg.content}</p>
                  <p className="mt-4 font-[Space_Grotesk] text-[10px] font-bold tracking-[0.05em] text-white/60">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          )}

          {isTyping && (
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-[#ff6b2b]/10 flex items-center justify-center text-[#ff6b2b] shrink-0">
                <Icon name="local_fire_department" fill={true} size={14} />
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none shadow-sm border border-orange-50/50 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>
      </div>

      {/* Input Footer */}
      <footer className="p-6 bg-[#fff8f4] shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4 items-center p-2 rounded-2xl bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-orange-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isTyping}
            placeholder="Tell Marshmallow about your day..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] px-4 placeholder:text-stone-300 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-[#802a00] text-white rounded-xl font-[Space_Grotesk] text-[12px] font-bold tracking-[0.05em] uppercase hover:bg-[#6b2c11] transition-all active:scale-95 disabled:opacity-50"
          >
            Ask AI
            <Icon name="auto_awesome" size={14} />
          </button>
        </div>
      </footer>
    </main>
  );
}
