import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getConversations } from "@/lib/queries/messages";
import MessagesClient from "@/app/(main)/messages/MessagesClient";

export default async function MessagesPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  const conversations = await getConversations(profile.id);

  return (
    <MessagesClient
      initialConversations={conversations}
      currentUserId={profile.id}
    />
  );
}
