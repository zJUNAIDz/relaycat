"use client"
import { ServerChannel } from "@/features/server/components/server-channel";
import { ServerSection } from "@/features/server/components/server-section";
import { Channel, ChannelType, MemberRole } from "@/generated/prisma/client";
import { ServerWithMembersAndUser } from "@/shared/types";
interface ChannelListProps {
  channelsGroupedByType: Channel[][];
  role: MemberRole;
  server: ServerWithMembersAndUser;
}

export const ChannelList: React.FC<ChannelListProps> = ({ channelsGroupedByType, role, server }) => {
  return (
    <>
      {
        channelsGroupedByType.map(channelList => (
          !!channelList.length && (
            <div key={channelList[0].id} className="space-y-2">
              <ServerSection
                label={`${channelList[0].type.toString()} Channels`}
                sectionType="channels"
                role={role}
                channelType={ChannelType.TEXT}
                server={server}
              />
              {
                channelList.map(channel => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    role={role}
                    server={server}
                  />
                ))
              }
            </div>
          ))

        )
      }

    </>
  )
}