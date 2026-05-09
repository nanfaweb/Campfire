"use client";

// ── HomeClient — Interactive Feed Component ──────────────────────────────────
// Receives server-fetched data as props; handles likes, saves, Marshmallow chat.

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { CreatePost } from "@/components/CreatePost";
import type { FeedPost, Profile, FriendSuggestion } from "@/types/database";
import Link from "next/link";

// ── Inline critical styles ───────────────────────────────────────────────────
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

const MARSHMALLOW_PROMPTS = [
  "What is the vibe today? ✨",
  "Write a cozy story 📖",
  "Show me local tea shops 🍵",
  "Creative prompt of the day 🎨",
  "Write a morning haiku 📜",
];

// ── Props ────────────────────────────────────────────────────────────────────

interface HomeClientProps {
  currentUser: Profile;
  initialPosts: FeedPost[];
  suggestions: FriendSuggestion[];
  friends?: Profile[];
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function HomeClient({
  currentUser,
  initialPosts,
  suggestions,
  friends = [],
}: HomeClientProps) {
  const searchParams = useSearchParams();
  const shouldCreate = searchParams.get("create") === "true";

  const [marshmallowMsg, setMarshmallowMsg] = useState("");
  const [marshmallowLoading, setMarshmallowLoading] = useState(false);
  const [followState, setFollowState] = useState<Record<string, boolean>>(
    Object.fromEntries(suggestions.map((u) => [u.id, u.initial_status === "pending"]))
  );
  const [homeSearch, setHomeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function askMarshmallow(prompt: string) {
    setMarshmallowLoading(true);
    setMarshmallowMsg("");
    try {
      const res = await fetch("/api/marshmallow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, session_id: "quick-chat" }),
      });

      if (!res.ok) throw new Error("API error");

      const json = await res.json();
      setMarshmallowMsg(json.reply ?? "✨ Something magical is brewing…");
    } catch {
      setMarshmallowMsg("Oops! My spark fizzled. Try again? 🔥");
    } finally {
      setMarshmallowLoading(false);
    }
  }

  async function handleFollow(targetUserId: string) {
    const targetUser = suggestions.find(u => u.id === targetUserId);
    const status = targetUser?.is_public_profile ? "accepted" : "pending";

    setFollowState((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const { error } = await supabase.from("friendships").insert({
        requester_id: currentUser.id,
        addressee_id: targetUserId,
        status, 
      });

      if (error) {
        if (error.code === "23505") return;
        throw error;
      }
      
      router.refresh();
    } catch (error) {
      setFollowState((prev) => ({ ...prev, [targetUserId]: false }));
      console.error("Error following user:", error);
    }
  }

  async function handleHomeSearch(val: string) {
    setHomeSearch(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${val}%,display_name.ilike.%${val}%`)
      .limit(5);
    
    if (data) setSearchResults(data as Profile[]);
    setIsSearching(false);
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && homeSearch.trim()) {
      router.push(`/explore?q=${encodeURIComponent(homeSearch.trim())}`);
    }
  };

  return (
    <>
      <style>{INLINE_STYLES}</style>

      {/* ── Feed ──────────────────────────────────────────────── */}
      <main className="ml-64 mr-80 flex-1 pt-8 px-8 max-w-2xl">
        {/* Search Bar */}
        <div className="relative mb-8 z-50">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
            <input
              type="text"
              value={homeSearch}
              onChange={(e) => handleHomeSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for friends or sparks... (Enter to explore)"
              className="w-full bg-white border border-orange-50 rounded-2xl py-4 pl-12 pr-6 shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-200 outline-none transition-all text-sm font-medium"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-orange-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {searchResults.map((user) => (
                <Link 
                  key={user.id} 
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-4 hover:bg-orange-50 transition-colors"
                >
                  <Avatar src={user.avatar_url} alt={user.username} size={40} />
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{user.display_name || user.username}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        {/* Stories / Active Friends */}
        <div className="flex gap-5 overflow-x-auto pb-8 no-scrollbar">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <Avatar
              src={currentUser.avatar_url}
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
          {friends.map(friend => (
            <div key={friend.id} className="flex-shrink-0 flex flex-col items-center gap-2">
              <Avatar
                src={friend.avatar_url}
                alt={friend.username}
                size={60}
                ring
              />
              <span
                className="text-[10px] tracking-widest uppercase text-zinc-600 font-bold"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {friend.username}
              </span>
            </div>
          ))}
        </div>

        {/* Create Post Section */}
        <CreatePost currentUser={currentUser} autoFocus={shouldCreate} />

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
          {initialPosts.length === 0 ? (
            <div className="text-center py-16">
              <Icon
                name="local_fire_department"
                size={48}
                className="text-orange-200 mx-auto mb-4"
              />
              <p className="text-zinc-400 text-sm">
                Your camp is quiet right now. Explore the camp and make new friends to light up your feed. 🔥
              </p>
            </div>
          ) : (
            initialPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
              />
            ))
          )}
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
            {suggestions.length === 0 ? (
              <p className="text-xs text-zinc-400">
                No new suggestions right now.
              </p>
            ) : (
              suggestions.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${s.username}`}>
                      <Avatar
                        src={s.avatar_url ?? ""}
                        alt={s.username}
                        size={32}
                      />
                    </Link>
                    <div>
                      <Link href={`/profile/${s.username}`}>
                        <p
                          className="text-xs font-bold text-zinc-800 hover:underline"
                          style={{ fontFamily: "Space Grotesk, sans-serif" }}
                        >
                          {s.username}
                        </p>
                      </Link>
                      <p className="text-[10px] text-zinc-400">
                        New to CampFire
                      </p>
                    </div>
                  </div>
                  {followState[s.id] ? (
                    <button
                      disabled
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {s.is_public_profile ? "Following" : "Pending"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(s.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#a83900] hover:underline"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      Follow
                    </button>
                  )}
                </div>
              ))
            )}
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

    </>
  );
}
