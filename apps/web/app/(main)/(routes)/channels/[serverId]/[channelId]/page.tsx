import { channelService } from "@/features/channel/channel-service";
import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { memberService } from "@/features/member/member-service";
import { ChannelType } from "@/generated/prisma/client";
import { CONFIG } from "@/shared/lib/config";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { getCurrentUser } from "@/shared/utils/server";
import { redirect } from "next/navigation";
interface ChannelIdPageProps {
  params: any
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { channelId } = await params;
  const { channel, error: err } = await channelService.getChannelById(channelId)
  if (!channel) {
    console.log("[ChannelIdPage] ", err)
    redirect(PAGE_ROUTES.HOME)
  }
  const user = await getCurrentUser();
  if (!user) {
    redirect(PAGE_ROUTES.AUTH)
  }
  const { member, error } = await memberService.getMemberByUserId(user.id)
  if (error || !member) {
    console.log("[ChannelIdPage] ", error)
    redirect(PAGE_ROUTES.HOME)
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
                memberId:member.id,
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