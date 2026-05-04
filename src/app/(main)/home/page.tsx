// ── Home Page (Server Component) ─────────────────────────────────────────────
// Fetches the authenticated user's profile, feed posts, and friend suggestions
// server-side, then passes them to the interactive HomeClient.

import { redirect } from "next/navigation";
import { getCurrentProfile, getFriendSuggestions, getFriends } from "@/lib/queries/profiles";
import { getFeedPosts } from "@/lib/queries/posts";
import HomeClient from "@/app/(main)/home/HomeClient";

export default async function HomePage() {
  // 1. Auth gate — redirect if not logged in
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  // 2. Parallel data fetch for performance
  const [posts, suggestions, friends] = await Promise.all([
    getFeedPosts(profile.id),
    getFriendSuggestions(profile.id, 5),
    getFriends(profile.id),
  ]);

  // 3. Render interactive client component with server-fetched data
  return (
    <HomeClient
      currentUser={profile}
      initialPosts={posts}
      suggestions={suggestions}
      friends={friends}
    />
  );
}
