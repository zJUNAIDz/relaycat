import "server-only"
import ChatHeader from "@/features/chat/components/chat-header";
import { conversationService } from "@/features/conversation/conversation-service";
import { memberService } from "@/features/member/member-service";
import { getCurrentUser } from "@/shared/utils/server";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>
}
const MemberIdPage = async ({ params }: MemberIdPageProps) => {
  // if (!(await params)) return <div>Params is undefined</div>
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
  return (
    <div className="bg-white dark:bg-[#313338]">
      <ChatHeader
        imageUrl={targetMember.user.image}
        serverId={serverId}
        type="conversation"
        label={targetMember.user.name}
      />
    </div>
  )
}
export default MemberIdPage;