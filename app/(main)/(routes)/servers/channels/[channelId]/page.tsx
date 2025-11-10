import { channelService } from "@/features/channel/channel-service";
import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { memberService } from "@/features/member/member-service";
import { ChannelType } from "@/generated/prisma/client";
import { MediaRoom } from "@/shared/components/media-room";
import { API_URL, SOCKET_URL } from "@/shared/lib/constants";
import { getCurrentUser } from "@/shared/utils/server";
import { redirect } from "next/navigation";
interface ChannelIdPageProps {
  params: any
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { serverId, channelId } = await params
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth")
  }
  const { channel } = await channelService.getChannelById(channelId)
  if (!channel) {
    redirect("/")
  }
  const { member, error } = await memberService.getMemberByUserId(user.id)
  if (error || !member) {
    redirect("/auth")
  }
  const memberId = member?.id;
  if (!member) {
    redirect("/")
  }
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#313338] ">
      <ChatHeader type="channel" label={channel.name} serverId={serverId} />
      {
        channel.type === ChannelType.TEXT && (
          <>
            <ChatMessages
              member={member}
              chatId={channel.id}
              name={channel.name}
              type="channel"
              apiUrl={`${API_URL}/messages`}
              socketUrl={SOCKET_URL}
              socketQuery={{
                channelId,
                serverId,
                userId: user.id
              }}
              paramKey="channelId"
              paramValue={channelId}
            />
            <ChatInput
              name={channel.name}
              type="channel"
              apiUrl={`${API_URL}/messages`}
              query={{
                channelId,
                memberId,
                serverId
              }}
            />
          </>
        )
      }
      {
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
      }
    </div>
  )
}
export default ChannelIdPage;