import { redirect } from "next/navigation";
import { getCurrentProfile, getPendingRequests } from "@/lib/queries/profiles";
import { getNotifications } from "@/lib/queries/notifications";
import NotificationsClient from "@/app/(main)/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  const [notifications, pendingRequests] = await Promise.all([
    getNotifications(profile.id),
    getPendingRequests(profile.id),
  ]);

  return (
    <NotificationsClient 
      initialNotifications={notifications} 
      initialRequests={pendingRequests}
      currentUserId={profile.id}
    />
  );
}
