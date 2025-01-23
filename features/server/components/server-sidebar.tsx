import { auth } from "@/auth";
import { db } from "@/shared/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";
import ServerHeader from "./server-header";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ServerSearch } from "@/features/server/navigation/server-search";
import { Hash, Mic, Video } from "lucide-react";
import { RoleIcon } from "@/shared/components/icons";
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
  const user = await auth().then((session) => session?.user);
  if (!user) return redirect("/login");

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          user: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  if (!server) return redirect("/");

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
  const role = server?.members.find(
    (member) => member.userId === user.id
  )?.role;

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
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
