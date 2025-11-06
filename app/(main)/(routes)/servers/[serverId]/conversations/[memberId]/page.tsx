import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { conversationService } from "@/features/conversation/conversation-service";
import { memberService } from "@/features/member/member-service";
import { API_URL, SOCKET_URL } from "@/shared/lib/constants";
import { getCurrentUser } from "@/shared/utils/server";
import { redirect } from "next/navigation";
import "server-only";

interface MemberIdPageProps {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>
}
const MemberIdPage = async ({ params }: MemberIdPageProps) => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?login=");
  const { memberId, serverId } = await params;
  const { member: currentMember } = await memberService.getMemberByUserId(user.id);
  if (!currentMember) redirect("/auth?login=")
  const { conversation: { conversation: { memberOne, memberTwo } }, error } = await conversationService.getOrCreatConversation(currentMember.id, memberId);
  if (error) {
    redirect(`/servers/${serverId}`)
  }
  const targetMember = memberOne.userId === currentMember.userId ? memberTwo : memberOne;
  const conversationId = targetMember.id;
  return (
    <div className=" flex flex-col bg-white dark:bg-[#313338]">
      <ChatHeader
        imageUrl={targetMember.user.image}
        serverId={serverId}
        type="conversation"
        label={targetMember.user.name}
      />
      <div className="flex-1" />
      <ChatMessages
        name={targetMember.user.name}
        member={currentMember}
        type="conversation"
        chatId={conversationId}
        apiUrl={`${API_URL}/conversations`}
        socketUrl={SOCKET_URL}
        socketQuery={{
          conversationId: conversationId,
          serverId: serverId
        }}
        paramKey="conversationId"
        paramValue={conversationId}
      />
      <ChatInput
        name={targetMember.user.name}
        type="conversation"
        apiUrl={`${API_URL}/messages`}
        query={{
          conversationId: conversationId,
          serverId: serverId
        }}
      />
    </div>
  )
}
export default MemberIdPage;