"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile, FeedPost, Story } from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { Icon } from "@/components/Icon";
import Link from "next/link";

interface ProfileClientProps {
  profile: Profile;
  posts: FeedPost[];
  currentUserId: string;
  initialFollowStatus: "accepted" | "pending" | "none";
  initialFollowers: Profile[];
  initialFollowing: Profile[];
  stories: Story[];
}

export default function ProfileClient({
  profile,
  posts,
  currentUserId,
  initialFollowStatus,
  initialFollowers,
  initialFollowing,
  stories,
}: ProfileClientProps) {
  const isOwnProfile = profile.id === currentUserId;
  const router = useRouter();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [followStatus, setFollowStatus] = useState<"accepted" | "pending" | "none">(initialFollowStatus);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);

  // Story state
  const [isViewingStories, setIsViewingStories] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          bio: bio.trim(),
        })
        .eq("id", profile.id);

      if (error) throw error;
      
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      router.refresh();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToggleFollow = async () => {
    if (isOwnProfile || saving) return;
    
    setSaving(true);
    const previousStatus = followStatus;
    setSaving(true);
    try {
      if (followStatus !== "none") {
        // Unfollow or Cancel Request
        const { error } = await supabase
          .from("friendships")
          .delete()
          .match({ requester_id: currentUserId, addressee_id: profile.id });

        if (error) throw error;
        setFollowStatus("none");
      } else {
        // Follow: handle public vs private
        const status = profile.is_public_profile ? "accepted" : "pending";
        const { error } = await supabase.from("friendships").insert({
          requester_id: currentUserId,
          addressee_id: profile.id,
          status,
        });

        if (error) {
          if (error.code === "23505") {
            console.log("Request already exists.");
          } else {
            throw error;
          }
        }
        setFollowStatus(status);
      }
      
      router.refresh();
    } catch (error: any) {
      setFollowStatus(previousStatus);
      console.error("Error updating follow status:", error?.message || error);
      alert(`Failed to update follow status: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isViewingStories) return;

    const timer = setTimeout(() => {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(prev => prev + 1);
      } else {
        setIsViewingStories(false);
        setCurrentStoryIndex(0);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isViewingStories, currentStoryIndex, stories.length]);

  const dateStr = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <main className="ml-64 flex-1 pt-8 px-10 max-w-5xl">
      <style>{`
        @keyframes story-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-story-progress { animation: story-progress 5s linear forwards; }
        .story-ring { background: linear-gradient(135deg,#FF6B2B 0%,#FF3CAC 50%,#784BA0 100%); }
      `}</style>
      {/* Profile Header */}
      <section className="bg-white rounded-3xl p-8 mb-12 shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border border-[rgba(255,107,43,0.1)] relative overflow-hidden">
        {/* Banner decorative element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-orange-200 to-rose-200 opacity-50 z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end mt-12">
          {/* Avatar Area with Story support */}
          <div 
            className={`relative group ${stories.length > 0 ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (stories.length > 0) {
                setIsViewingStories(true);
                setCurrentStoryIndex(0);
              }
            }}
          >
            <div className={`rounded-full p-1 shadow-xl transition-transform ${stories.length > 0 ? 'story-ring group-hover:scale-105' : 'bg-white'} ${uploadingAvatar ? 'animate-pulse' : ''}`}>
              <div className="bg-white p-1 rounded-full">
                <Avatar src={profile.avatar_url} alt={profile.username} size={132} />
              </div>
            </div>
            
            {isOwnProfile && (
              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={uploadingAvatar}
                className="absolute bottom-4 right-4 bg-orange-500 text-white p-2.5 rounded-full shadow-lg hover:bg-orange-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 z-10"
                title="Change Avatar"
              >
                <Icon name="photo_camera" size={20} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Info Area */}
          <div className="flex-1 pb-4">
            {isEditing ? (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-orange-50/50 border border-orange-100 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-all font-[Space_Grotesk]"
                    placeholder="Enter display name..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full bg-orange-50/50 border border-orange-100 rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-all font-[Space_Grotesk] resize-none"
                    placeholder="Tell us your story..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-orange-600 disabled:opacity-50 text-sm"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(profile.display_name || "");
                      setBio(profile.bio || "");
                    }}
                    disabled={saving}
                    className="bg-zinc-100 text-zinc-600 px-6 py-2 rounded-xl font-bold hover:bg-zinc-200 disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-black text-[#231a11] font-[Space_Grotesk] mb-1">
                  {profile.display_name || profile.username}
                  {profile.is_verified && <span className="text-orange-500 ml-2 text-xl">✨</span>}
                </h1>
                <p className="text-lg text-zinc-500 font-semibold mb-4">@{profile.username}</p>
                
                <p className="text-zinc-700 leading-relaxed max-w-2xl mb-6">
                  {profile.bio || (isOwnProfile ? "Write something about yourself..." : "This camper is keeping quiet for now.")}
                </p>

                <div className="flex items-center gap-6 text-sm font-semibold text-zinc-500">
                  <span className="flex items-center gap-1.5"><Icon name="calendar_today" size={18} /> Joined {dateStr(profile.created_at)}</span>
                </div>

                <div className="flex gap-8 mt-8">
                  <button 
                    onClick={() => setShowFollowersList(true)}
                    className="flex flex-col items-start group transition-all p-3 -m-3 rounded-2xl hover:bg-orange-50/50"
                  >
                    <span className="text-2xl font-black text-[#231a11] group-hover:text-orange-500 transition-colors">
                      {initialFollowers.length}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Followers</span>
                  </button>
                  <button 
                    onClick={() => setShowFollowingList(true)}
                    className="flex flex-col items-start group transition-all p-3 -m-3 rounded-2xl hover:bg-orange-50/50"
                  >
                    <span className="text-2xl font-black text-[#231a11] group-hover:text-orange-500 transition-colors">
                      {initialFollowing.length}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Following</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Area */}
          {!isEditing && (
            <div className="pb-4">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors text-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleToggleFollow}
                    disabled={saving}
                    className={`px-8 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm active:scale-95
                      ${followStatus === "accepted" 
                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-red-600" 
                        : followStatus === "pending"
                        ? "bg-orange-100 text-orange-400 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                  >
                    {saving ? "..." : followStatus === "accepted" ? "Unfollow" : followStatus === "pending" ? "Request Sent" : "Follow"}
                  </button>
                  <Link
                    href={`/messages?userId=${profile.id}`}
                    className="bg-white border border-orange-100 text-orange-600 hover:bg-orange-50 px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm flex items-center gap-2 active:scale-95"
                  >
                    <Icon name="mail" size={18} />
                    Message
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Posts Section */}
      <section className="mb-24">
        <h3 className="text-2xl font-bold text-[#231a11] mb-6 font-[Space_Grotesk]">
          {isOwnProfile ? "Your Sparks" : `${profile.display_name || profile.username}'s Sparks`}
        </h3>

        {!isOwnProfile && !profile.is_public_profile && followStatus !== "accepted" ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-orange-100 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <Icon name="lock" size={32} className="text-orange-400" />
            </div>
            <h4 className="text-xl font-bold text-[#231a11] mb-2 font-[Space_Grotesk]">This account is private</h4>
            <p className="text-zinc-500 max-w-xs">Follow them to see their sparks and join the conversation! 🔒</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-zinc-100">
            <p className="text-zinc-400 font-medium">No sparks yet.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </section>

      {/* User Lists Modals */}
      {(showFollowersList || showFollowingList) && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => { setShowFollowersList(false); setShowFollowingList(false); }}
        >
          <div 
            className="bg-white w-full max-w-2xl mx-4 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 border border-orange-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 border-b border-orange-50 flex items-center justify-between bg-gradient-to-r from-orange-50/30 to-white">
              <div>
                <h3 className="text-3xl font-black text-[#231a11] font-[Space_Grotesk]">
                  {showFollowersList ? "Followers" : "Following"}
                </h3>
                <p className="text-sm text-zinc-400 font-medium mt-1">
                  {showFollowersList ? initialFollowers.length : initialFollowing.length} people
                </p>
              </div>
              <button 
                onClick={() => { setShowFollowersList(false); setShowFollowingList(false); }}
                className="w-12 h-12 flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 rounded-2xl transition-all shadow-sm active:scale-90 bg-zinc-50"
              >
                <Icon name="close" size={28} />
              </button>
            </div>
            
            <div className="max-h-[60vh] min-h-[400px] overflow-y-auto p-8 space-y-6 no-scrollbar bg-white">
              {(showFollowersList ? initialFollowers : initialFollowing).length === 0 ? (
                <p className="text-center py-8 text-zinc-400 font-medium italic">
                  {showFollowersList ? "No followers yet." : "Not following anyone yet."}
                </p>
              ) : (
                (showFollowersList ? initialFollowers : initialFollowing).map((u) => (
                  <Link 
                    key={u.id} 
                    href={`/profile/${u.username}`}
                    onClick={() => { setShowFollowersList(false); setShowFollowingList(false); }}
                    className="flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-orange-50 transition-all group border border-transparent hover:border-orange-100"
                  >
                    <Avatar src={u.avatar_url} alt={u.username} size={56} />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-[#231a11] group-hover:text-orange-600 transition-colors">{u.display_name || u.username}</p>
                      <p className="text-sm text-zinc-400">@{u.username}</p>
                    </div>
                    <div className="bg-zinc-50 p-2 rounded-xl group-hover:bg-orange-100 transition-colors">
                      <Icon name="chevron_right" size={24} className="text-zinc-300 group-hover:text-orange-400" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Story Viewer Modal */}
      {isViewingStories && stories.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-4 left-0 w-full px-4 flex gap-1.5 z-50">
            {stories.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  key={`${profile.id}-${idx}-${currentStoryIndex}`}
                  className={`h-full bg-white ${idx === currentStoryIndex ? 'animate-story-progress' : idx < currentStoryIndex ? 'w-full' : 'w-0'}`}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-10 left-4 flex items-center gap-3 z-50">
            <Avatar src={profile.avatar_url} alt="author" size={40} ring />
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm drop-shadow-md leading-tight">
                {profile.display_name || profile.username}
              </span>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                {new Date(stories[currentStoryIndex].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsViewingStories(false)}
            className="absolute top-10 right-4 text-white p-2 hover:bg-white/10 rounded-full z-50 transition-colors"
          >
            <Icon name="close" size={28} />
          </button>

          <div className="relative w-full h-[90vh] max-w-[500px] aspect-[9/16] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
            <div 
              className="absolute left-0 top-0 w-1/4 h-full cursor-pointer z-30"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentStoryIndex(prev => Math.max(0, prev - 1));
              }}
            />
            <div 
              className="absolute right-0 top-0 w-1/4 h-full cursor-pointer z-30"
              onClick={(e) => {
                e.stopPropagation();
                if (currentStoryIndex < stories.length - 1) {
                  setCurrentStoryIndex(prev => prev + 1);
                } else {
                  setIsViewingStories(false);
                }
              }}
            />

            {/* Visible Navigation Buttons */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentStoryIndex(prev => Math.max(0, prev - 1));
                }}
                className="bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-2xl border border-white/20"
              >
                <Icon name="chevron_left" size={32} />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentStoryIndex < stories.length - 1) {
                    setCurrentStoryIndex(prev => prev + 1);
                  } else {
                    setIsViewingStories(false);
                  }
                }}
                className="bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-2xl border border-white/20"
              >
                <Icon name="chevron_right" size={32} />
              </button>
            </div>

            {stories[currentStoryIndex].media_type === "video" ? (
              <video 
                src={stories[currentStoryIndex].media_url} 
                autoPlay 
                muted={false}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={stories[currentStoryIndex].media_url} 
                alt="story" 
                className="w-full h-full object-cover select-none"
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
