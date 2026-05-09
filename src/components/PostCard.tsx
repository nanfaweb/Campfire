"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { FeedPost, Comment } from "@/types/database";
import Link from "next/link";

interface PostCardProps {
  post: FeedPost;
  currentUserId: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(post.user_has_liked);
  const [saved, setSaved] = useState(post.user_has_saved);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [busy, setBusy] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const dateStr = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  async function toggleLike() {
    if (busy) return;
    setBusy(true);

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      const res = await fetch("/api/likes", {
        method: wasLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id }),
      });

      if (!res.ok) {
        setLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setBusy(false);
    }
  }

  async function toggleSave() {
    if (busy) return;
    setBusy(true);

    const wasSaved = saved;
    setSaved(!wasSaved);

    try {
      const res = await fetch("/api/saved", {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id }),
      });

      if (!res.ok) {
        setSaved(wasSaved);
      } else {
        router.refresh();
      }
    } catch {
      setSaved(wasSaved);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleComments() {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from("comments")
        .select(`*, author:profiles!author_id(*)`)
        .eq("post_id", post.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true });
      
      if (!error && data) {
        setComments(data as unknown as Comment[]);
      }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        author_id: currentUserId,
        content: newComment.trim(),
      })
      .select(`*, author:profiles!author_id(*)`)
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as unknown as Comment]);
      setNewComment("");
      setCommentCount((c) => c + 1);
    }
    setSubmittingComment(false);
  }

  return (
    <article className="custom-card-border rounded-xl overflow-hidden bg-white shadow-[0_4px_24px_rgba(253,235,208,0.2)]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar src={post.author.avatar_url} alt={post.author.username} size={40} />
          </Link>
          <div>
            <div className="flex items-center gap-1">
              <Link href={`/profile/${post.author.username}`}>
                <span className="font-bold text-sm text-zinc-900 font-[Space_Grotesk] hover:underline">
                  {post.author.username}
                </span>
              </Link>
              {post.author.is_verified && <span className="text-orange-500 text-xs">✨</span>}
            </div>
            <span className="text-[10px] font-[Space_Grotesk] tracking-wide uppercase text-zinc-400">
              {dateStr}
            </span>
          </div>
        </div>
        <button className="text-zinc-300 hover:text-orange-500 transition-colors">
          <Icon name="more_horiz" size={20} />
        </button>
      </div>

      {/* Media */}
      {post.video_link ? (
        <div className="aspect-video w-full bg-orange-50 overflow-hidden">
          <video src={post.video_link} controls className="w-full h-full object-cover" />
        </div>
      ) : post.media_urls.length > 0 ? (
        <div className="aspect-video w-full bg-orange-50 overflow-hidden">
          <img src={post.media_urls[0]} alt="Post media" className="w-full h-full object-cover" />
        </div>
      ) : null}

      {/* Body */}
      <div className="p-5">
        <p className="text-sm text-zinc-600 leading-relaxed mb-4">{post.content}</p>

        {/* Interactions */}
        <div className="flex items-center justify-between border-t border-orange-50 pt-4">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 transition-all ${liked ? "text-orange-600 scale-110" : "text-zinc-400 hover:text-orange-400"}`}
            >
              <Icon name="local_fire_department" fill={liked} size={22} />
              <span className="text-xs font-bold font-[Space_Grotesk]">{likeCount}</span>
            </button>
            <button
              onClick={handleToggleComments}
              className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 transition-colors"
            >
              <Icon name="chat_bubble" size={20} />
              <span className="text-xs font-bold font-[Space_Grotesk]">{commentCount}</span>
            </button>
            <button className="text-zinc-400 hover:text-orange-400 transition-colors">
              <Icon name="share" size={20} />
            </button>
          </div>
          <button
            onClick={toggleSave}
            className={`transition-all ${saved ? "text-orange-600 scale-110" : "text-zinc-400 hover:text-orange-400"}`}
          >
            <Icon name="bookmark" fill={saved} size={22} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-orange-50 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-4 mb-6">
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-xs text-zinc-400 italic">No comments yet. Be the first to spark a conversation!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar src={c.author?.avatar_url} alt={c.author?.username || "user"} size={32} />
                    <div className="flex-1 bg-orange-50/50 rounded-2xl p-3">
                      <p className="text-xs font-bold text-zinc-900 mb-1">{c.author?.username}</p>
                      <p className="text-xs text-zinc-600">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-zinc-50 border-none rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-orange-200 outline-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Icon name="send" size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
