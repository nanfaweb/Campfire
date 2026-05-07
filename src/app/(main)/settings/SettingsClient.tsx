"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Profile } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

export default function SettingsClient({ profile }: { profile: Profile }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.display_name || "",
    bio: profile.bio || "",
    marshmallowConsent: profile.marshmallow_consent,
  });

  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({
          display_name: formData.displayName,
          bio: formData.bio,
          marshmallow_consent: formData.marshmallowConsent,
        })
        .eq("id", profile.id);
      
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      // Ensure browser auth state is cleared as well.
      await supabase.auth.signOut();
      router.push("/signup");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="ml-64 flex-1 flex flex-col min-h-screen">
      <div className="px-10 py-12 max-w-[1100px] w-full">
        <h1 className="text-4xl text-[#FF6B2B] font-extrabold mb-3">Settings</h1>
        <p className="text-[#644E43] font-medium text-lg mb-12 max-w-2xl">
          Refine your CampFire experience. Customize your presence and privacy.
        </p>

        <div className="flex gap-8 items-start">
          <div className="flex-1 flex flex-col gap-6 max-w-2xl">
            {/* Profile Card */}
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border border-[#F5EBE1]">
              <h2 className="text-2xl text-[#843615] font-extrabold mb-6">Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-300 outline-none resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Privacy & AI Card */}
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border border-[#F5EBE1]">
              <h2 className="text-2xl text-[#843615] font-extrabold mb-6">Privacy & AI</h2>
              
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.marshmallowConsent}
                  onChange={(e) => setFormData({ ...formData, marshmallowConsent: e.target.checked })}
                  className="mt-1 w-5 h-5 accent-[#FF6B2B]"
                />
                <div>
                  <span className="block font-bold text-zinc-800">Marshmallow AI Consent</span>
                  <span className="text-sm text-zinc-500">Allow Marshmallow AI to index your private posts to provide you with personalized answers and content retrieval. (Your data is never shared with others).</span>
                </div>
              </label>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_-2px_hsla(25,30%,20%,0.08)] border border-[#F5EBE1]">
              <h2 className="text-2xl text-[#843615] font-extrabold mb-6">Account</h2>
              <p className="text-sm text-zinc-500 mb-5">
                End your current session on this device.
              </p>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-8 py-3 rounded-xl bg-[#843615] text-white font-bold flex items-center gap-2 hover:bg-[#6b2c11] transition-colors shadow-md disabled:opacity-50"
              >
                <Icon name="logout" size={18} className="text-white" />
                {isLoggingOut ? "Logging Out..." : "Log Out"}
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 rounded-xl bg-[#843615] text-white font-bold flex items-center gap-2 hover:bg-[#6b2c11] transition-colors shadow-md disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
