"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { Profile } from "@/types/database";

interface CreatePostProps {
  currentUser: Profile;
  onPostCreated?: () => void;
}

export function CreatePost({ currentUser, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{url: string, type: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index].url);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setLoading(true);

    try {
      const mediaUrls: string[] = [];
      let uploadedVideoUrl: string | null = null;

      // 1. Upload files to Supabase Storage
      if (files.length > 0) {
        for (const file of files) {
          const isVideo = file.type.startsWith("video/");
          const fileExt = file.name.split(".").pop();
          const fileName = `${currentUser.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `posts/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("post-media")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("post-media")
            .getPublicUrl(filePath);

          if (isVideo && !uploadedVideoUrl) {
            uploadedVideoUrl = publicUrl;
          } else {
            mediaUrls.push(publicUrl);
          }
        }
      }

      // 2. Insert post into database
      const { error: insertError } = await supabase.from("posts").insert({
        author_id: currentUser.id,
        content: content.trim(),
        media_urls: mediaUrls,
        video_link: uploadedVideoUrl,
        visibility: "public",
      });

      if (insertError) throw insertError;

      // 3. Success feedback & Reset
      setContent("");
      setFiles([]);
      setPreviews([]);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      
      if (onPostCreated) {
        onPostCreated();
      } else {
        // Refresh the current route to fetch new data
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-card-border rounded-2xl p-5 mb-8 bg-white/80 backdrop-blur-sm shadow-xl transition-all hover:shadow-2xl">
      <div className="flex gap-4">
        <Avatar src={currentUser.avatar_url} alt={currentUser.username} size={48} />
        
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="What's sparking today?"
            className="w-full bg-transparent border-none focus:ring-0 text-zinc-800 placeholder:text-zinc-400 resize-none min-h-[48px] py-2 text-lg font-[Space_Grotesk]"
            disabled={loading}
          />

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 mt-2 no-scrollbar">
              {previews.map((preview, i) => (
                <div key={preview.url} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden group">
                  {preview.type.startsWith("video/") ? (
                    <video src={preview.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}


          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full hover:bg-orange-50 text-zinc-400 hover:text-orange-500 transition-all group"
                title="Add Media"
              >
                <Icon name="image" size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && files.length === 0)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-md
                ${loading || (!content.trim() && files.length === 0)
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Sparking...
                </>
              ) : (
                "Spark It"
              )}
            </button>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
