import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";
import ServerHeader from "./server-header";
interface ServerSidebarProps {
  serverId: string;
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
  const members = server?.members.filter((member) => member.userId !== user.id);
  const role = server?.members.find(
    (member) => member.userId === user.id
  )?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
    </div>
  );
};

export default ServerSidebar;
