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
  highlight?: string;
}

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

export function PostCard({ post, currentUserId, highlight }: PostCardProps) {
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
  
  // Edit/Delete state
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isDeleted, setIsDeleted] = useState(false);
  const [saving, setSaving] = useState(false);
  
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

  async function handleSaveEdit() {
    if (!editedContent.trim() || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ content: editedContent.trim() })
        .eq("id", post.id);

      if (error) throw error;
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update spark.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost() {
    if (!confirm("Are you sure you want to extinguish this spark forever? 🕯️")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/posts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete spark");
      }

      setIsDeleted(true);
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(`Failed to delete spark: ${err.message || "Something went wrong"}`);
    } finally {
      setBusy(false);
    }
  }

  if (isDeleted) return null;

  return (
    <article className="custom-card-border rounded-xl overflow-hidden bg-white shadow-[0_4px_24px_rgba(253,235,208,0.2)]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar src={post.author.avatar_url} alt={post.author.username} size={40} />
          </Link>
          <div className="flex flex-col">
            <Link href={`/profile/${post.author.username}`} className="font-bold text-sm text-[#231a11] hover:text-orange-500 transition-colors leading-tight font-[Space_Grotesk]">
              {post.author.display_name || post.author.username}
            </Link>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{dateStr}</span>
          </div>
        </div>

        {post.author_id === currentUserId && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
            >
              <Icon name="more_horiz" size={20} />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-2xl shadow-xl border border-zinc-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-zinc-600 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
                  >
                    <Icon name="edit" size={18} /> Edit Spark
                  </button>
                  <button 
                    onClick={() => { handleDeletePost(); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <Icon name="delete" size={18} /> Delete Spark
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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
        {isEditing ? (
          <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-4 rounded-2xl bg-orange-50/50 border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 text-zinc-800 text-sm resize-none font-[Space_Grotesk]"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => { setIsEditing(false); setEditedContent(post.content); }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-800 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap font-[Space_Grotesk]">
            <Highlight text={post.content} highlight={highlight || ""} />
          </p>
        )}

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
