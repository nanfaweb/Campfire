import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getNotifications } from "@/lib/queries/notifications";
import NotificationsClient from "@/app/(main)/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  const notifications = await getNotifications(profile.id);

  return <NotificationsClient initialNotifications={notifications} />;
}
