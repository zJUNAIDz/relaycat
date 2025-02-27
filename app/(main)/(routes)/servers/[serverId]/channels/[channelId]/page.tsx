import ChatHeader from "@/features/chat/components/chat-header";
import currentProfile from "@/shared/lib/current-profile";
import { db } from "@/shared/lib/db";
import { redirect } from "next/navigation";
interface ChannelIdPageProps {
  params: any
}


const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { serverId, channelId } = await params
  const { profile } = await currentProfile();
  if (!profile) {
    return redirect("/auth")
  }
  //*TODO: move db logic to server
  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    }
  })
  const member = await db.member.findFirst({
    where: {
      serverId,
      user: {
        id: profile.id
      }
    }
  })
  if (!channel || !member) {
    redirect("/")
  }
  return <div className="bg-white dark:bg-[#313338]">
    <ChatHeader type="channel" label={channel.name} serverId={serverId} />
  </div>
}
export default ChannelIdPage;