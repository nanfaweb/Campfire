import { redirect } from "next/navigation";
import { getCurrentProfile, getProfileByUsername } from "@/lib/queries/profiles";
import { getUserPosts } from "@/lib/queries/posts";
import ProfileClient from "@/app/(main)/profile/[username]/ProfileClient";

// Force dynamic since profile data/posts change often
export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    redirect("/auth/signup");
  }

  const profile = await getProfileByUsername(username);
  if (!profile) {
    // If user doesn't exist, maybe redirect to a 404 or just home for now
    redirect("/home");
  }

  const posts = await getUserPosts(profile.id, currentProfile.id);

  return (
    <ProfileClient 
      profile={profile} 
      posts={posts} 
      currentUserId={currentProfile.id} 
    />
  );
}
