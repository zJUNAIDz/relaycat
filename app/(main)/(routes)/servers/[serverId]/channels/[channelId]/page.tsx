import ChatHeader from "@/features/chat/components/chat-header";
import { ChatInput } from "@/features/chat/components/chat-input";
import { memberService } from "@/features/member/member-service";
import { API_URL } from "@/shared/lib/constants";
import currentProfile from "@/shared/lib/current-profile";
import { getAuthTokenOnServer, getCurrentUser } from "@/shared/utils/server";
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

  const url = `${API_URL}/channels/${channelId}`
  const { data: { channel: { channel } } } = await axios.get(url, {
    headers: {
      "Authorization": `Bearer ${await getAuthTokenOnServer()}`
    }
  })
  if (!channel) {
    redirect("/")
  }
  const { member: { id: memberId } } = await memberService.getMemberByUserId(user.id)
  if (!memberId) {
    redirect("/")
  }
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#313338] ">
      <ChatHeader type="channel" label={channel.name} serverId={serverId} />
      <div className="flex-1">
        messages
      </div>
      <ChatInput
        name={channel.name}
        type="channel"
        apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/messages`}
        query={{
          channelId,
          memberId,
          serverId
        }}
      />
    </div>
  )
}
export default ChannelIdPage;