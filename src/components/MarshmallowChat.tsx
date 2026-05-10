"use client";

import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Icon } from "./Icon";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MarshmallowChat({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Marshmallow. I'm here to help you find your sparks and keep the campfire cozy! ☁️🔥" }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userQuery = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setIsThinking(true);

    try {
      // Phase 1: Search Phase (Retrieve Context/Embers)
      // We assume an Edge Function or RPC 'match_marshmallow_index' handles the RAG retrieval
      // If query_embedding is needed, it's usually handled inside the Edge Function for security
      const { data: embers, error: searchError } = await supabase.rpc("match_marshmallow_index", {
        query_text: userQuery,
        requesting_user: userId,
        match_threshold: 0.5,
        match_count: 3
      });

      if (searchError) {
        console.warn("Search phase error (falling back to general chat):", searchError);
      }

      const context = embers 
        ? embers.map((e: any) => e.chunk_text).join("\n") 
        : "No specific embers found.";

      // Phase 2: Chat Phase (Gemini API)
      // Note: In a production app, we would call an API route to hide the key.
      // But based on instructions, we're implementing the orchestration here.
      const res = await fetch("/api/marshmallow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userQuery, 
          context: context,
          session_id: "marshmallow-chat-widget" 
        }),
      });

      if (!res.ok) throw new Error("Marshmallow's spark fizzled out...");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! My fluff got a bit tangled. Can you try again? 🍬" }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-[Space_Grotesk]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-orange-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-pink-400 p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Icon name="local_fire_department" fill={true} size={20} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm leading-tight">Marshmallow</h3>
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Cozy Buddy</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-orange-50/20 custom-scrollbar">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`
                  max-w-[80%] px-5 py-3 rounded-[1.5rem] text-sm shadow-sm
                  ${msg.role === "user" 
                    ? "bg-[#802a00] text-white rounded-tr-none" 
                    : "bg-white text-zinc-800 rounded-tl-none border border-orange-100"}
                `}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white px-5 py-3 rounded-[1.5rem] rounded-tl-none border border-orange-100 shadow-sm flex flex-col gap-2">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-orange-200 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-orange-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest animate-pulse">Marshmallow is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-orange-50">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Marshmallow..."
                className="w-full pl-5 pr-12 py-3 bg-orange-50/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-200/50 border border-orange-100"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="absolute right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50 active:scale-95 shadow-md"
              >
                <Icon name="auto_awesome" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95
          ${isOpen ? "bg-[#231a11]" : "bg-orange-500 ember-glow"}
        `}
      >
        {isOpen ? (
          <Icon name="close" size={28} className="text-white" />
        ) : (
          <Icon name="local_fire_department" fill={true} size={32} className="text-white" />
        )}
      </button>

      <style jsx global>{`
        @keyframes glowing-text {
          0% { opacity: 0.5; text-shadow: 0 0 5px rgba(255,107,43,0.2); }
          50% { opacity: 1; text-shadow: 0 0 15px rgba(255,107,43,0.5); }
          100% { opacity: 0.5; text-shadow: 0 0 5px rgba(255,107,43,0.2); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .ember-glow {
          box-shadow: 0 0 20px rgba(255,107,43,0.4);
        }
      `}</style>
    </div>
  );
}
