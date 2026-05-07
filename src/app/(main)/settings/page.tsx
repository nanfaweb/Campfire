import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import SettingsClient from "@/app/(main)/settings/SettingsClient";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/signup");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const providers =
    user?.identities?.map((identity) => identity.provider).filter(Boolean) ?? [];
  const isManualUser =
    providers.includes("email") || user?.app_metadata?.provider === "email";
  const authEmail = user?.email ?? "";

  return (
    <SettingsClient
      profile={profile}
      canResetPassword={isManualUser}
      authEmail={authEmail}
    />
  );
}
