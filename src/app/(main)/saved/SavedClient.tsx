"use client";

import React, { useState } from "react";
import type { FeedPost, Profile } from "@/types/database";
import { PostCard } from "@/components/PostCard";
import { Icon } from "@/components/Icon";

interface SavedClientProps {
  initialPosts: FeedPost[];
  currentUser: Profile;
}

export default function SavedClient({
  initialPosts,
  currentUser,
}: SavedClientProps) {
  const [posts, setPosts] = useState(initialPosts);

  return (
    <main className="ml-64 flex-1 pt-8 px-10 max-w-5xl">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-[#231a11] font-[Space_Grotesk]">
          Saved Sparks
        </h2>
        <p className="text-zinc-500 font-medium mt-1">
          Your bookmarked collection of cozy moments.
        </p>
      </header>

      <div className="pb-24">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[2.5rem] border border-orange-50">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-200">
              <Icon name="bookmark" size={40} />
            </div>
            <p className="text-xl font-bold text-[#231a11] font-[Space_Grotesk]">No saved sparks yet</p>
            <p className="text-zinc-400 mt-2 max-w-xs text-center">
              Bookmark posts to keep track of inspiration and memories.
            </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
