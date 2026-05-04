import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  return <SettingsClient profile={profile} />;
}
