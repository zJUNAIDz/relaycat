"use client"
import { ServerChannel } from "@/features/server/components/server-channel";
import { ServerSection } from "@/features/server/components/server-section";
import { Permission, usePermissions } from "@/shared/lib/permissions";
import { Channel, ChannelType, ServerWithMembersAndUser } from "@/shared/types";
interface ChannelListProps {
  channelsGroupedByType: Channel[][];
  server: ServerWithMembersAndUser;
}

export const ChannelList: React.FC<ChannelListProps> = ({ channelsGroupedByType, server }) => {
  const { can } = usePermissions(server);
  const canManageChannels = can(Permission.MANAGE_CHANNELS);
  return (
    <>
      {
        channelsGroupedByType.map(channelList => (
          !!channelList.length && (
            <div key={channelList[0].id} className="space-y-2">
              <ServerSection
                label={`${channelList[0].type.toString()} Channels`}
                sectionType="channels"
                canManageChannels={canManageChannels}
                channelType={ChannelType.TEXT}
                server={server}
              />
              {
                channelList.map(channel => (
                  <ServerChannel
                    key={channel.id}
                    channel={channel}
                    canManageChannels={canManageChannels}
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
