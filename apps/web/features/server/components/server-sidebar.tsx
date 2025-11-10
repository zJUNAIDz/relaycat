import { ChannelList } from "@/features/channel/components/channels-list";
import { ServerSearch } from "@/features/server/navigation/server-search";
import { ChannelType, MemberRole } from "@/generated/prisma/client";
import { RoleIcon } from "@/shared/components/icons";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { authClient } from "@/shared/lib/auth-client";
import { Hash, Mic, Video } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { serverService } from "../server-service";
import ServerHeader from "./server-header";
import { ServerMembersList } from "./server-member-list";
import { UserFooter } from "./user-footer";
import { DEFAULT_APP_PAGE } from "@/shared/lib/constants";
interface ServerSidebarProps {
  serverId: string;
}

const channelIconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.ADMIN]: <RoleIcon role={MemberRole.ADMIN} />,
  [MemberRole.MODERATOR]: <RoleIcon role={MemberRole.MODERATOR} />,
  [MemberRole.GUEST]: <RoleIcon role={MemberRole.GUEST} />,
}

const ServerSidebar: React.FC<ServerSidebarProps> = async ({ serverId }) => {
  const { data, error } = await authClient.getSession();
  if (error) {
    return redirect("/auth");
  }

  const server = await serverService.getServer(serverId, ["user", "channels"])
  if (!server) return redirect(DEFAULT_APP_PAGE);

  const textChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );
  const videoChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );
  const members = server?.members;
  const role = server.members.find(
    (member) => member.userId === data?.user.id
  )?.role;
  if (!role) return redirect("/auth");
  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <ServerSearch
          data={[
            {
              label: "Text Channels",
              type: "channel",
              data: textChannels.map(channel => ({
                icon: channelIconMap[channel.type],
                name: channel.name,
                id: channel.id
              }))
            },
            {
              label: "Voice Channels",
              type: "channel",
              data: audioChannels.map(channel => ({
                icon: channelIconMap[channel.type],
                name: channel.name,
                id: channel.id
              }))
            },
            {
              label: "Video Channels",
              type: "channel",
              data: videoChannels.map(channel => ({
                icon: channelIconMap[channel.type],
                name: channel.name,
                id: channel.id
              }))
            },
            {
              label: "Members",
              type: "member",
              data: members?.map(member => ({
                icon: roleIconMap[member.role],
                name: member.user.name || "",
                id: member.userId
              }))
            },
          ]}
        />
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        <ChannelList
          channelsGroupedByType={[
            textChannels,
            audioChannels,
            videoChannels,
          ]}
          role={role}
          server={server}
        />
        <ServerMembersList members={server.members} serverId={serverId} />
      </ScrollArea>
      <UserFooter name={data?.user.name ?? "Na"} username="NA" imageUrl={data?.user.image ?? ""} />
    </div>
  );
};

export default ServerSidebar;
