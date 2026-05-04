import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getOrCreateSession, getChatbotMessages } from "@/lib/queries/chatbot";
import MarshmallowClient from "./MarshmallowClient";

export default async function MarshmallowPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/auth/signup");
  }

  const session = await getOrCreateSession(profile.id);
  if (!session) {
    return <div>Failed to initialize chat session</div>;
  }

  const messages = await getChatbotMessages(session.id);

  return (
    <MarshmallowClient
      sessionId={session.id}
      initialMessages={messages}
    />
  );
}
