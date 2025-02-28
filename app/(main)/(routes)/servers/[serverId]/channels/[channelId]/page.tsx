import ChatHeader from "@/features/chat/components/chat-header";
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
  const user = getCurrentUser();
  if (!user) {
    return redirect("/auth")
  }
  //*TODO: move db logic to server
  const url = `${API_URL}/channels/${channelId}`
  const { data: { channel } } = await axios.get(url, {
    headers: {
      "Authorization": `Bearer ${await getAuthTokenOnServer()}`
    }
  })
  if (!channel) {
    redirect("/")
  }
  return <div className="bg-white dark:bg-[#313338]">
    <ChatHeader type="channel" label={channel.name} serverId={serverId} />
  </div>
}
export default ChannelIdPage;