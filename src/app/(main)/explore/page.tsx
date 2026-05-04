// ── Explore Page (Server Component) ──────────────────────────────────────────

import { redirect } from "next/navigation";
import { getCurrentProfile, getRecommendedUsers } from "@/lib/queries/profiles";
import { getExplorePosts } from "@/lib/queries/posts";
import ExploreClient from "./ExploreClient";

export default async function ExplorePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  const [posts, recommendedUsers] = await Promise.all([
    getExplorePosts(profile.id),
    getRecommendedUsers(profile.id, 6),
  ]);

  return (
    <ExploreClient
      posts={posts}
      recommendedUsers={recommendedUsers}
      currentUserId={profile.id}
    />
  );
}
