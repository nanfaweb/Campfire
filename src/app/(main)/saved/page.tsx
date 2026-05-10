import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getSavedPosts } from "@/lib/queries/posts";
import SavedClient from "@/app/(main)/saved/SavedClient";

export default async function SavedPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  const posts = await getSavedPosts(profile.id);

  return (
    <SavedClient
      initialPosts={posts}
      currentUser={profile}
    />
  );
}
