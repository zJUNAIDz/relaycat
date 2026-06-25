import { conversationService } from "@/features/conversation/conversation-service";
import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { CONFIG } from "@/shared/lib/config";
import type { Member } from "@/shared/types";
import { getCurrentUser } from "@/shared/utils/server";
import { notFound, unauthorized } from "next/navigation";

interface DmPageProps {
  params: Promise<{ channelId: string }>;
}

const DmChannelPage = async ({ params }: DmPageProps) => {
  const user = await getCurrentUser();
  if (!user) unauthorized();

  const { channelId } = await params;

  // Validates participation server-side and resolves the other participant.
  let dm;
  try {
    dm = await conversationService.get(channelId);
  } catch {
    notFound();
  }

  const other = dm.otherUser;
  const name = other.displayName || other.username || other.name;

  // DMs have no server member; synthesise one whose id is the current user's
  // id so the chat UI's ownership checks (member.id === currentMember.id) work
  // against the author-id-based member the API returns for DM messages.
  const currentMember = {
    id: user.id,
    userId: user.id,
    role: "MEMBER",
  } as unknown as Member;

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader
        type="conversation"
        label={name}
        imageUrl={other.avatar ?? undefined}
      />
      <ChatMessages
        member={currentMember}
        chatId={channelId}
        name={name}
        type="conversation"
        apiUrl={`/dm/${channelId}/messages`}
        socketUrl={CONFIG.SOCKET_URL}
        socketQuery={{ channelId, userId: user.id }}
        paramKey="conversationId"
        paramValue={channelId}
      />
      <ChatInput
        name={name}
        type="conversation"
        apiUrl={`/dm/${channelId}/messages`}
        query={{ channelId }}
      />
    </div>
  );
};

export default DmChannelPage;
