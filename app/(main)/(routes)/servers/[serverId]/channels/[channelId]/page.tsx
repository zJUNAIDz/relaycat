import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { ChatMessages } from "@/features/chat/components/chat-messages";
import { memberService } from "@/features/member/member-service";
import { MediaRoom } from "@/shared/components/media-room";
import { API_URL, SOCKET_URL } from "@/shared/lib/constants";
import { getAuthTokenOnServer, getCurrentUser } from "@/shared/utils/server";
import { ChannelType } from "@prisma/client";
import axios from "axios";
import { redirect } from "next/navigation";
interface ChannelIdPageProps {
  params: any
}


// export async function generateMetadata({ params }: ChannelIdPageProps) {
//   const { channelId } = await params
//   // const channel = await db.channel.findUnique({
//   //   where: {
//   //     id: channelId,
//   //   },
//   //   include: {
//   //     server: {
//   //       select: {
//   //         name: true,
//   //       }
//   //     }
//   //   }
//   // })

//   return {
//     title: "channel"
//     // title: `#${channel?.name} | ${channel?.server.name} `,
//   }
// }


const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { serverId, channelId } = await params
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth")
  }
  const token = await getAuthTokenOnServer();
  if (!token) {
    return redirect("/auth")
  }
  const url = `${API_URL}/channels/${channelId}`
  const { data: { channel: { channel } } } = await axios.get(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
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