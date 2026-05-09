"use client";

// ── HomeClient — Interactive Feed Component ──────────────────────────────────
// Receives server-fetched data as props; handles likes, saves, Marshmallow chat.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { FeedPost, Profile, FriendSuggestion, Comment } from "@/types/database";
import { CreatePost } from "@/components/CreatePost";
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

// ── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentUserId,
}: {
  post: FeedPost;
  currentUserId: string;
}) {
  const [liked, setLiked] = useState(post.user_has_liked);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [busy, setBusy] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const supabase = createClient();

  async function toggleLike() {
    if (busy) return;
    setBusy(true);

    // Optimistic update
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
        // Revert on failure
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

  const dateStr = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="custom-card-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar
              src={post.author.avatar_url}
              alt={post.author.username}
              size={40}
            />
          </Link>
          <div>
            <div className="flex items-center gap-1">
              <Link href={`/profile/${post.author.username}`}>
                <span className="font-bold text-sm text-zinc-900 font-[Space_Grotesk] hover:underline">
                  {post.author.username}
                </span>
              </Link>
              {post.author.is_verified && (
                <span className="text-orange-500 text-xs">✨</span>
              )}
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
          <video
            src={post.video_link}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      ) : post.media_urls.length > 0 ? (
        <div className="aspect-video w-full bg-orange-50 overflow-hidden">
          <img
            src={post.media_urls[0]}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      {/* Body */}
      <div className="p-5">
        <p className="text-sm text-zinc-600 leading-relaxed">{post.content}</p>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-5">
          <button
            onClick={toggleLike}
            disabled={busy}
            className="flex items-center gap-1.5 group"
          >
            <Icon
              name="favorite"
              fill={liked}
              size={20}
              className={`transition-colors ${
                liked
                  ? "text-red-500"
                  : "text-zinc-300 group-hover:text-red-400"
              }`}
            />
            <span className="text-xs text-zinc-400">{likeCount}</span>
          </button>

          <button 
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 group"
          >
            <Icon
              name="chat_bubble"
              size={20}
              className="text-zinc-300 group-hover:text-orange-400 transition-colors"
            />
            <span className="text-xs text-zinc-400">
              {commentCount}
            </span>
          </button>

          <button className="flex items-center gap-1.5 group">
            <Icon
              name="send"
              size={20}
              className="text-zinc-300 group-hover:text-orange-400 transition-colors"
            />
          </button>

          <button
            onClick={() => setSaved((v) => !v)}
            className="ml-auto"
          >
            <Icon
              name="bookmark"
              fill={saved}
              size={20}
              className={`transition-colors ${
                saved
                  ? "text-orange-500"
                  : "text-zinc-300 hover:text-orange-400"
              }`}
            />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-5 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300">
            {loadingComments ? (
              <div className="py-4 text-center text-xs text-zinc-400 animate-pulse">
                Loading comments...
              </div>
            ) : (
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-xs text-center text-zinc-400 py-2">No comments yet. Be the first!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar src={comment.author?.avatar_url} alt={comment.author?.username} size={28} />
                      <div className="flex-1 bg-zinc-50 rounded-2xl rounded-tl-none p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-zinc-900 font-[Space_Grotesk]">
                            {comment.author?.username}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* New Comment Input */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-3 mt-2">
              <Avatar src={post.author.avatar_url} alt="You" size={32} /> {/* Note: Should ideally be current user avatar, but we only have currentUserId here. Falling back to simple UI */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  disabled={submittingComment}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-orange-300 focus:bg-white transition-all font-[Space_Grotesk] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-orange-500 hover:text-orange-600 disabled:text-zinc-300 disabled:hover:text-zinc-300 transition-colors"
                >
                  <Icon name="send" size={18} fill={!!newComment.trim()} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

// ── Marshmallow Prompts ──────────────────────────────────────────────────────

const MARSHMALLOW_PROMPTS = [
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
  const [marshmallowMsg, setMarshmallowMsg] = useState("");
  const [marshmallowLoading, setMarshmallowLoading] = useState(false);
  const [followState, setFollowState] = useState<Record<string, boolean>>({});
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
    setFollowState((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const { error } = await supabase.from("friendships").insert({
        requester_id: currentUser.id,
        addressee_id: targetUserId,
        status: "accepted", // Auto-accept for "Follow" model; change to 'pending' if you want mutual approval
      });

      if (error) {
        if (error.code === "23505") {
          // Already following
          return;
        }
        throw error;
      }
      
      router.refresh();
    } catch (error) {
      setFollowState((prev) => ({ ...prev, [targetUserId]: false }));
      console.error("Error following user:", error);
    }
  }

  return (
    <>
      <style>{INLINE_STYLES}</style>

      {/* ── Feed ──────────────────────────────────────────────── */}
      <main className="ml-64 mr-80 flex-1 pt-8 px-8 max-w-2xl">
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
        <CreatePost currentUser={currentUser} />

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
                      Following
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
