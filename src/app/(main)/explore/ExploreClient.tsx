"use client";

// ── ExploreClient — Interactive Explore Component ────────────────────────────

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FeedPost, FriendSuggestion } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import Link from "next/link";

interface ExploreClientProps {
  posts: FeedPost[];
  recommendedUsers: FriendSuggestion[];
  currentUserId: string;
}

export default function ExploreClient({
  posts,
  recommendedUsers,
  currentUserId,
}: ExploreClientProps) {
  const [followState, setFollowState] = useState<Record<string, boolean>>(
    Object.fromEntries(recommendedUsers.map((u) => [u.id, u.initial_status === "pending"]))
  );
  const [searchTerm, setSearchTerm] = useState("");

  const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight || !highlight.trim()) return <>{text}</>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-orange-200 text-orange-900 px-0.5 rounded">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync with query parameter (from Home page)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchTerm(q);
  }, [searchParams]);

  async function toggleFollow(userId: string) {
    const isFollowing = followState[userId];
    // Optimistic update
    setFollowState((prev) => ({ ...prev, [userId]: !isFollowing }));

    try {
      if (isFollowing) {
        // Remove friendship request
        await supabase
          .from("friendships")
          .delete()
          .match({ requester_id: currentUserId, addressee_id: userId });
      } else {
        // Follow: handle public vs private
        const targetUser = recommendedUsers.find(u => u.id === userId);
        const status = targetUser?.is_public_profile ? "accepted" : "pending";
        
        await supabase.from("friendships").insert({
          requester_id: currentUserId,
          addressee_id: userId,
          status,
        });
      }
      router.refresh();
    } catch {
      // Revert on failure
      setFollowState((prev) => ({ ...prev, [userId]: isFollowing }));
    }
  }

  const dateStr = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const filteredUsers = recommendedUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.bio || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.author.display_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="ml-64 flex-1 pt-8 px-10 max-w-5xl">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h2
          className="text-2xl font-bold text-[#231a11]"
          style={{ fontFamily: "Space Grotesk" }}
        >
          Explore sparks
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <input
              className="bg-white border-none rounded-full px-6 py-2 w-64 shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] focus:ring-2 focus:ring-[#ff6b2b] transition-all text-sm outline-none"
              placeholder="Search the woods..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-4 top-2 text-[#8d7167] text-base">
              search
            </span>
          </div>
        </div>
      </header>

      {/* Section tab */}
      <div className="flex gap-8 mb-8 border-b border-orange-100">
        <div
          className="pb-4 relative font-bold text-lg capitalize text-[#231a11]"
          style={{ fontFamily: "Space Grotesk" }}
        >
          Recommended
          <div className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-gradient-to-r from-[#ff6b2b] to-[#ff3cac]" />
        </div>
      </div>

      {/* Recommended Users */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3
              className="text-2xl font-bold text-[#231a11]"
              style={{ fontFamily: "Space Grotesk" }}
            >
              New faces
            </h3>
            <p className="text-base text-[#58423a]">
              Recommended based on your sparks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <p className="col-span-3 text-center text-zinc-400 py-8">
              {searchTerm ? "No users match your search." : "No new faces to show right now."}
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border border-[rgba(255,107,43,0.1)] flex flex-col items-center text-center group"
              >
                <div className="mb-4">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar
                      src={user.avatar_url}
                      alt={user.username}
                      size={96}
                      ring
                    />
                  </Link>
                </div>
                <Link href={`/profile/${user.username}`}>
                  <h4
                    className="font-bold text-base text-[#231a11] hover:underline"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    <Highlight text={user.display_name || user.username} highlight={searchTerm} />
                  </h4>
                </Link>
                <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#8d7167] mb-6">
                  <Highlight text={user.bio?.slice(0, 30) || "CampFire member"} highlight={searchTerm} />
                </p>
                {followState[user.id] ? (
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className="w-full py-2 rounded-xl bg-[#a83900] text-white font-bold text-sm shadow-md shadow-[#a83900]/20 transition-all duration-200 hover:opacity-90"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    {user.is_public_profile ? "Following" : "Request Sent"}
                  </button>
                ) : (
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className="w-full py-2 rounded-xl border border-[#ff6b2b] text-[#ff6b2b] font-bold text-sm hover:bg-[#ff6b2b] hover:text-white transition-all duration-200"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    Follow
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Sparks Feed */}
      <section className="pb-24">
        <h3
          className="text-2xl font-bold text-[#231a11] mb-6"
          style={{ fontFamily: "Space Grotesk" }}
        >
          Recent sparks
        </h3>
        {filteredPosts.length === 0 ? (
          <p className="text-center text-zinc-400 py-8">
            {searchTerm ? "No sparks match your search." : "No sparks to explore yet. Check back soon! ✨"}
          </p>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard
                  post={post}
                  currentUserId={currentUserId}
                  highlight={searchTerm}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
