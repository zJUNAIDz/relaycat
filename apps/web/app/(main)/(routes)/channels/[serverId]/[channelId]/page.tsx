import { channelService } from "@/features/channel/channel-service";
import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { memberService } from "@/features/member/member-service";
import { CONFIG } from "@/shared/lib/config";
import { ChannelType } from "@/shared/types";
import { getCurrentUser } from "@/shared/utils/server";
import { notFound, unauthorized } from "next/navigation";
interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { channelId } = await params;
  const channel = await channelService.getChannelById(channelId)
  if (!channel) {
    notFound()
  }
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }
  const member = await memberService.getMemberByUserId(user.id)
  if (!member) {
    notFound()
  }
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#313338] ">
      <ChatHeader type="channel" label={channel.name} />
      {
        channel.type === ChannelType.TEXT && (
          <>
            <ChatMessages
              member={member}
              chatId={channel.id}
              name={channel.name}
              type="channel"
              apiUrl={`${CONFIG.API_URL}/messages`}
              socketUrl={CONFIG.SOCKET_URL}
              socketQuery={{
                channelId,
                userId: user.id
              }}
              paramKey="channelId"
              paramValue={channelId}
            />
            <ChatInput
              name={channel.name}
              type="channel"
              apiUrl={`${CONFIG.API_URL}/messages`}
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