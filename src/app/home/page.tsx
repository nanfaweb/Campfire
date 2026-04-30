"use client";

import { useState } from "react";
import FEED_DATA, {
  type Post,
  type FeedData,
} from "./data/feed";

// ── Inline critical styles (moved from <style> in old JSX) ────────────────────
const INLINE_STYLES = `
  .story-ring { background: linear-gradient(135deg,#FF6B2B 0%,#FF3CAC 50%,#784BA0 100%); }
  .custom-card-border { position:relative; background:#fff; box-shadow:0 4px 24px rgba(253,235,208,.4); }
  .custom-card-border::after { content:''; position:absolute; inset:0; border-radius:16px; padding:1px;
    background:linear-gradient(135deg,#FF6B2B 0%,#FF3CAC 100%);
    -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude; opacity:.12; pointer-events:none; }
  .gradient-text { background:linear-gradient(135deg,#FF6B2B,#FF3CAC);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .no-scrollbar::-webkit-scrollbar { display:none; }
  .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
`;

// ── Small utility components ──────────────────────────────────────────────────

interface IconProps {
  name: string;
  fill?: boolean;
  size?: number;
  className?: string;
}

function Icon({ name, fill = false, size = 24, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  );
}

interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
  ring?: boolean;
}

function Avatar({ src, alt = "", size = 40, ring = false }: AvatarProps) {
  return (
    <div
      className={`flex-shrink-0 rounded-full overflow-hidden bg-orange-50 ${ring ? "p-[3px] story-ring" : ""}`}
      style={{ width: size, height: size }}
    >
      {ring ? (
        <div className="bg-white p-0.5 rounded-full w-full h-full">
          <img
            src={src}
            alt={alt}
            className="rounded-full w-full h-full object-cover"
          />
        </div>
      ) : (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      )}
    </div>
  );
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────
interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "home", label: "Home", active: true },
  { icon: "search", label: "Search" },
  { icon: "explore", label: "Explore" },
  { icon: "mail", label: "Messages" },
  { icon: "favorite", label: "Notifications" },
  { icon: "cloud", label: "Marshmallow" },
  { icon: "settings", label: "Settings" },
];

// ── Post card ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);

  function toggleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  }

  return (
    <article className="custom-card-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.author.avatarUrl}
            alt={post.author.username}
            size={40}
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-zinc-900 font-[Space_Grotesk]">
                {post.author.username}
              </span>
              <span className="text-orange-500 text-xs">
                {post.author.badge}
              </span>
            </div>
            <span className="text-[10px] font-[Space_Grotesk] tracking-wide uppercase text-zinc-400">
              {post.timestamp} · {post.location}
            </span>
          </div>
        </div>
        <button className="text-zinc-300 hover:text-orange-500 transition-colors">
          <Icon name="more_horiz" size={20} />
        </button>
      </div>

      {/* Body */}
      {post.type === "image" && post.imageUrl && (
        <div className="aspect-video w-full bg-orange-50 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.imageAlt ?? ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {post.type === "quote" && post.quote && (
          <div className="bg-orange-50 rounded-lg p-6 mb-4 border border-orange-100/50">
            <p className="text-lg font-bold text-[#a83900] leading-relaxed italic text-center font-[Space_Grotesk]">
              &ldquo;{post.quote}&rdquo;
            </p>
          </div>
        )}
        <p className="text-sm text-zinc-600 leading-relaxed">{post.body}</p>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-5">
          <button onClick={toggleLike} className="flex items-center gap-1.5 group">
            <Icon
              name="favorite"
              fill={liked}
              size={20}
              className={`transition-colors ${liked ? "text-red-500" : "text-zinc-300 group-hover:text-red-400"}`}
            />
            <span className="text-xs text-zinc-400">{likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 group">
            <Icon
              name="chat_bubble"
              size={20}
              className="text-zinc-300 group-hover:text-orange-400 transition-colors"
            />
            <span className="text-xs text-zinc-400">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 group">
            <Icon
              name="send"
              size={20}
              className="text-zinc-300 group-hover:text-orange-400 transition-colors"
            />
          </button>
          <button onClick={() => setSaved((v) => !v)} className="ml-auto">
            <Icon
              name="bookmark"
              fill={saved}
              size={20}
              className={`transition-colors ${saved ? "text-orange-500" : "text-zinc-300 hover:text-orange-400"}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Marshmallow prompt chips ──────────────────────────────────────────────────
const MARSHMALLOW_PROMPTS = [
  "Show me local tea shops 🍵",
  "Creative prompt of the day 🎨",
  "Write a morning haiku 📜",
];

// ── Main page component ───────────────────────────────────────────────────────
export default function CampFirePage() {
  const [marshmallowMsg, setMarshmallowMsg] = useState("");
  const [marshmallowLoading, setMarshmallowLoading] = useState(false);

  const { currentUser, stories, posts, suggestions }: FeedData = FEED_DATA;

  // Marshmallow AI chip
  async function askMarshmallow(prompt: string) {
    setMarshmallowLoading(true);
    setMarshmallowMsg("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are Marshmallow, a warm and playful AI buddy on CampFire social network. Keep replies under 3 sentences, use 1-2 emojis. User asked: "${prompt}"`,
            },
          ],
        }),
      });
      const json = await res.json();
      setMarshmallowMsg(
        json.content?.[0]?.text ?? "✨ Something magical is brewing…",
      );
    } catch {
      setMarshmallowMsg("Oops! My spark fizzled. Try again? 🔥");
    } finally {
      setMarshmallowLoading(false);
    }
  }

  return (
    <>
      <style>{INLINE_STYLES}</style>

      <div className="flex min-h-screen bg-[#FFF8F2]">
        {/* ── Left Sidebar ─────────────────────────────────────── */}
        <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-orange-50 flex flex-col overflow-y-auto z-50">
          <div
            className="py-8 px-6 text-2xl font-black tracking-tight gradient-text"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            CampFire
          </div>

          <div className="flex-1 flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ icon, label, active }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-4 px-6 py-3.5 transition-all duration-150 rounded-r-full mr-4 ${
                  active
                    ? "text-[#FF6B2B] font-bold bg-orange-50"
                    : "text-zinc-500 hover:text-[#FF6B2B] hover:bg-orange-50/60"
                }`}
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <Icon name={icon} fill={!!active} size={22} />
                <span className="text-base">{label}</span>
              </a>
            ))}
          </div>

          {/* Profile */}
          <div className="border-t border-orange-50 py-5 px-6">
            <a
              href="#"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar src={currentUser.avatarUrl} alt="Profile" size={36} />
              <span
                className="text-sm font-bold text-zinc-700"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {currentUser.username}
              </span>
            </a>
          </div>
        </nav>

        {/* ── Feed ─────────────────────────────────────────────── */}
        <main className="ml-64 mr-80 flex-1 pt-8 px-8 max-w-2xl">
          {/* Stories */}
          <div className="flex gap-5 overflow-x-auto pb-8 no-scrollbar">
            {/* Your story */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <Avatar
                src={currentUser.avatarUrl}
                alt="Your Story"
                size={60}
                ring
              />
              <span
                className="text-[10px] tracking-widest uppercase text-zinc-400"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Your Story
              </span>
            </div>
            {stories.map((s) => (
              <div
                key={s.id}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <Avatar src={s.avatarUrl} alt={s.username} size={60} ring />
                <span
                  className="text-[10px] tracking-widest uppercase text-zinc-400"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {s.username}
                </span>
              </div>
            ))}
          </div>

          {/* Marshmallow chip */}
          <div className="mb-8">
            <div className="custom-card-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon
                    name="auto_awesome"
                    fill
                    size={20}
                    className="gradient-text"
                  />
                  <span
                    className="text-sm text-zinc-500"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    What&apos;s on your mind? Ask Marshmallow…
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {MARSHMALLOW_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => askMarshmallow(q)}
                    className="px-3 py-1.5 rounded-full border border-orange-200 text-xs font-semibold text-[#a83900] hover:bg-orange-50 transition-colors"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {(marshmallowLoading || marshmallowMsg) && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg text-sm text-zinc-600 leading-relaxed">
                  {marshmallowLoading ? (
                    <span className="animate-pulse text-orange-400">
                      ✨ Marshmallow is thinking…
                    </span>
                  ) : (
                    marshmallowMsg
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-8 pb-24">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>

        {/* ── Right Sidebar ─────────────────────────────────────── */}
        <aside className="fixed right-0 top-0 h-screen w-80 pt-8 px-6 overflow-y-auto bg-transparent">
          {/* Marshmallow widget */}
          <div className="bg-[#FDF0E8] rounded-xl p-5 mb-8 border border-orange-100/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-lg">
                🔥
              </div>
              <div>
                <h3
                  className="font-bold text-sm text-zinc-800"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Marshmallow
                </h3>
                <p
                  className="text-[10px] tracking-widest uppercase text-orange-500"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Your AI Buddy
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              &ldquo;Hi friend! I&apos;m here to help you find your spark today.
              What should we do?&rdquo;
            </p>
            <div className="flex flex-col gap-2">
              {MARSHMALLOW_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => askMarshmallow(q)}
                  className="bg-white px-3 py-2 rounded-full border border-orange-200 text-xs font-semibold text-[#a83900] text-left hover:bg-orange-50 transition-colors"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Friend suggestions */}
          <div className="px-1">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-sm text-zinc-800"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Campfire Friends
              </h3>
              <button
                className="text-[10px] uppercase tracking-widest text-[#a83900] font-bold"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {suggestions.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={s.avatarUrl} alt={s.username} size={32} />
                    <div>
                      <p
                        className="text-xs font-bold text-zinc-800"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {s.username}
                      </p>
                      <p className="text-[10px] text-zinc-400">{s.reason}</p>
                    </div>
                  </div>
                  <button
                    className="text-[10px] font-bold uppercase tracking-widest text-[#a83900] hover:underline"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 px-1 text-[9px] tracking-widest uppercase text-zinc-300 space-y-2">
            <div className="flex gap-4">
              {["About", "Terms", "Privacy", "Policy"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-orange-400 transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
            <p>© 2025 CampFire ✨ Stay Warm</p>
          </div>
        </aside>

        {/* FAB */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#a83900] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
          <Icon name="add" size={28} />
        </button>
      </div>
    </>
  );
}
