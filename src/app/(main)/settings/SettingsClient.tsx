"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { Profile } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

interface SettingsClientProps {
  profile: Profile;
  canResetPassword: boolean;
  authEmail: string;
}

export default function SettingsClient({
  profile,
  canResetPassword,
  authEmail,
}: SettingsClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    marshmallowConsent: profile.marshmallow_consent,
  });

  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({
          marshmallow_consent: formData.marshmallowConsent,
        })
        .eq("id", profile.id);

      setSaveSuccess("Settings saved successfully.");
    } catch (e) {
      console.error(e);
      setSaveError("Failed to save settings.");
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

  const handlePasswordReset = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!canResetPassword) {
      setPasswordError(
        "Password reset is not available for Google sign-in accounts."
      );
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to reset password.");
      }

      setPasswordSuccess("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to reset password.";
      setPasswordError(message);
    } finally {
      setIsResettingPassword(false);
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
              <h2 className="text-2xl text-[#843615] font-extrabold mb-6">Security</h2>
              <p className="text-sm text-zinc-500 mb-5">
                Change your password for your CampFire account.
              </p>
              {!canResetPassword && (
                <div className="mb-5 text-sm rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-600">
                  Password reset is unavailable for Google OAuth accounts.
                </div>
              )}
              {canResetPassword && (
                <p className="text-xs text-zinc-400 mb-4">
                  Signed in as {authEmail || "email account"}
                </p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    disabled={!canResetPassword || isResettingPassword}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-300 outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    disabled={!canResetPassword || isResettingPassword}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-300 outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={!canResetPassword || isResettingPassword}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-300 outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="mt-4 text-sm text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="mt-4 text-sm text-emerald-700">{passwordSuccess}</p>
              )}

              <button
                onClick={handlePasswordReset}
                disabled={!canResetPassword || isResettingPassword}
                className="mt-6 px-8 py-3 rounded-xl bg-[#843615] text-white font-bold flex items-center gap-2 hover:bg-[#6b2c11] transition-colors shadow-md disabled:opacity-50"
              >
                {isResettingPassword ? "Updating Password..." : "Update Password"}
              </button>
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

            <div className="flex justify-center mt-4">
              <div className="flex flex-col items-center gap-3">
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                {saveSuccess && <p className="text-sm text-emerald-700">{saveSuccess}</p>}
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
      </div>
    </main>
  );
}
