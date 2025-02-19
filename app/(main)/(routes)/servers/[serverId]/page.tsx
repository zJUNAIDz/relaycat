import DefaultServerPage from "@/features/server/components/default-server-page";
import currentProfile from "@/shared/lib/current-profile";
import { db } from "@/shared/lib/db";
import { redirect } from "next/navigation";
import React from "react";
interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}
const ServerIdPage: React.FC<ServerIdPageProps> = async ({ params: { serverId } }) => {

  const { profile } = await currentProfile();
  const channel = await db.channel.findFirst({
    where: {
      server: {
        id: serverId,
        members: {
          some: {
            user: {
              id: profile?.id
            }
          }
        }
      },
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
    }
  })
  if (!channel) {
    return <DefaultServerPage />;
  }
  return redirect(`/servers/${serverId}/channels/${channel.id}`)
}
export default ServerIdPage;