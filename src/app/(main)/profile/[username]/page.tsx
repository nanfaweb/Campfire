import { redirect } from "next/navigation";
import { getCurrentProfile, getProfileByUsername, isFollowing, getFollowers, getFollowing } from "@/lib/queries/profiles";
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
    redirect("/home");
  }

  const [posts, followingStatus, followers, following] = await Promise.all([
    getUserPosts(profile.id, currentProfile.id),
    isFollowing(currentProfile.id, profile.id),
    getFollowers(profile.id),
    getFollowing(profile.id),
  ]);

  return (
    <ProfileClient 
      profile={profile} 
      posts={posts} 
      currentUserId={currentProfile.id}
      isFollowingInitial={followingStatus}
      initialFollowers={followers}
      initialFollowing={following}
    />
  );
}
