import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import SettingsClient from "@/app/(main)/settings/SettingsClient";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/signup");
  }

  return <SettingsClient profile={profile} />;
}
