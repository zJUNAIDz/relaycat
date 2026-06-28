import { channelService } from "@/features/channel/channel-service";
import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { TypingIndicator } from "@/features/typing/components/typing-indicator";
import { memberService } from "@/features/member/member-service";
import { CONFIG } from "@/shared/lib/config";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { ChannelType } from "@/shared/types";
import { getCurrentUser } from "@/shared/utils/server";
import { notFound, redirect } from "next/navigation";
interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(PAGE_ROUTES.AUTH)
  }

  const { channelId } = await params;
  const channel = await channelService.getChannelById(channelId)
  if (!channel) {
    notFound()
  }
  const member = await memberService.getMemberByUserId(user.id)
  if (!member) {
    notFound()
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader type="channel" label={channel.name} />
      {
        channel.type === ChannelType.TEXT && (
          <>
            <ChatMessages
              member={member}
              chatId={channel.id}
              name={channel.name}
              type="channel"
              apiUrl={`/channels/${channel.id}/messages`}
              socketUrl={CONFIG.SOCKET_URL}
              socketQuery={{
                channelId,
                userId: user.id
              }}
              paramKey="channelId"
              paramValue={channelId}
            />
            <TypingIndicator chatId={channel.id} currentUserId={user.id} />
            <ChatInput
              name={channel.name}
              type="channel"
              apiUrl={`/channels/${channel.id}/messages`}
              chatId={channel.id}
              selfName={user.name}
              query={{
                channelId,
                memberId: member.id,
              }}
            />
          </>
        )
      }
      {/* // TODO: FIX LIVEKIT MEDIA ROOMS */}
      {/* {
        channel.type === ChannelType.AUDIO && (
          <MediaRoom
            chatId={channel.id}
            audio={true}
            video={false}
          />
        )
      }
      {
        channel.type === ChannelType.VIDEO && (
          <MediaRoom
            chatId={channel.id}
            audio={false}
            video={true}
          />
        )
      } */}
    </div>
  )
}
export default ChannelIdPage;