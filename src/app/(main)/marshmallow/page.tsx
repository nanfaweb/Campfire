'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@/components/Icon'

interface Message {
  id: number
  role: 'ai' | 'user'
  content: string
  time: string
  tags?: string[]
  isTyping?: boolean
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'ai',
    content: "Good morning! I've been keeping the fire warm for you. Ready to explore some new ideas or just need someone to chat with today? 🪵🔥",
    time: '8:04 AM',
  },
  {
    id: 2,
    role: 'user',
    content: "Hey Marshmallow! I'm looking for some inspiration for a new digital sketchbook. Something that feels 'Cozy Shonen' – you know, energetic but peaceful?",
    time: '8:05 AM',
  },
  {
    id: 3,
    role: 'ai',
    content: "I love that vibe! Think about utilizing **Golden Hour** light. We could use expansive whitespace paired with soft, tactile textures like paper grains. 🎨✨",
    time: '8:06 AM',
    tags: ['#minimalism', '#tactile-design'],
  },
]

const memories = [
  '"Interested in watercolor textures for app backgrounds."',
  '"Prefers dark orange over neon palettes."',
]

const suggestedTopics = ['Anime layout tips', 'Cozy color codes', 'Wellness reminders']

export default function MarshmallowPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const now = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      time: now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: "That's a spark worth exploring! Let me fan those flames and bring some warmth to your ideas. 🔥",
        time: now(),
      }
      setMessages((prev) => [...prev, aiMsg])
    }, 1800)
  }
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
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-[24px] font-bold text-[#231a11]">
              Marshmallow AI
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#ff6b2b] rounded-full animate-pulse" />
              <span className="font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold tracking-[0.05em] text-[#802a00] opacity-70 uppercase">
                Online &amp; Toasty
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-[#fdebdc] rounded-full text-stone-500 transition-colors">
            <Icon name="auto_awesome" size={24} />
          </button>
          <button className="p-2 hover:bg-[#fdebdc] rounded-full text-stone-500 transition-colors">
            <Icon name="more_vert" size={24} />
          </button>
        </div>
      </header>

      {/* Chat Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <section className="flex-1 overflow-y-auto chat-scroll px-8 py-10 space-y-8 bg-[#fff8f4]">
          {messages.map((msg) =>
            msg.role === 'ai' ? (
              <div key={msg.id} className="flex items-start gap-4 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-[#ff6b2b]/10 flex items-center justify-center text-[#ff6b2b] shrink-0">
                  <Icon name="local_fire_department" fill={true} size={14} />
                </div>
                <div className="bg-white p-6 rounded-2xl rounded-tl-none ambient-shadow border border-orange-50/50">
                  <p className="text-[16px] leading-[1.5] text-[#231a11]">{msg.content}</p>
                  {msg.tags && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {msg.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-orange-50 text-[#ff6b2b] text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold tracking-[0.05em] text-stone-400">
                    {msg.time}
                  </p>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-start gap-4 max-w-3xl ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[#802a00]/10 flex items-center justify-center text-[#802a00] shrink-0">
                  <Icon name="account_circle" size={14} />
                </div>
                <div className="bg-[#802a00] p-6 rounded-2xl rounded-tr-none shadow-lg text-white">
                  <p className="text-[16px] leading-[1.5]">{msg.content}</p>
                  <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold tracking-[0.05em] text-white/60">
                    {msg.time}
                  </p>
                </div>
              </div>
            )
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-[#ff6b2b]/10 flex items-center justify-center text-[#ff6b2b] shrink-0">
                <Icon name="local_fire_department" fill={true} size={14} />
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none ambient-shadow border border-orange-50/50 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce animation-delay-150" />
                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce animation-delay-300" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Right Sidebar: Memories */}
        <aside className="w-80 border-l border-orange-50 bg-white/50 p-6 hidden xl:block shrink-0 overflow-y-auto chat-scroll">
          <div className="mb-8">
            <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-[16px] text-[#802a00] mb-4 flex items-center gap-2">
              <Icon name="psychology" size={20} />
              Memories
            </h3>
            <div className="space-y-3">
              {memories.map((memory, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/80 border border-orange-50 text-sm text-stone-600 hover:border-[#ff6b2b]/30 transition-colors cursor-default"
                >
                  {memory}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] font-bold text-[16px] text-[#802a00] mb-4 flex items-center gap-2">
              <Icon name="lightbulb" size={20} />
              Suggested Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setInput(topic)}
                  className="px-4 py-2 rounded-full border border-orange-100 bg-white text-xs font-semibold text-stone-500 hover:bg-orange-50 hover:text-[#802a00] transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Input Footer */}
      <footer className="p-6 bg-[#fff8f4] shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4 items-center p-2 rounded-2xl bg-white gradient-border-mask shadow-lg">
          <button className="p-3 text-stone-400 hover:text-[#802a00] transition-colors">
            <Icon name="add_circle" size={24} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tell Marshmallow about your day..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] placeholder:text-stone-300 outline-none"
          />
          <button
            onClick={sendMessage}
            className="flex items-center gap-2 px-6 py-3 bg-[#802a00] text-white rounded-xl font-[family-name:var(--font-space-grotesk)] text-[12px] font-bold tracking-[0.05em] uppercase hover:bg-[#ff52b0] hover:text-[#5f003b] transition-all active:scale-95"
          >
            Ask AI
            <Icon name="auto_awesome" size={14} />
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[10px] text-stone-400 font-[family-name:var(--font-space-grotesk)] font-bold tracking-[0.05em] uppercase">
            Marshmallow can make mistakes. Verify important sparks.
          </p>
        </div>
      </footer>
    </main>
  )
}
