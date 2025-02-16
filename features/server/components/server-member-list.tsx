// "use client"
import { ServerWithMembersAndUser } from "@/shared/types";
import { Server } from "@prisma/client";
import { ServerMember } from "./server-member";
import { ServerSection } from "./server-section";

interface ServerMembersListProps {
  members: ServerWithMembersAndUser["members"]
  serverId: Server["id"]
}
export const ServerMembersList: React.FC<ServerMembersListProps> = async ({ members, serverId }) => {
  //TODO: fix this

  //* Impossible edge case
  if (!members?.length) return <div>No members</div>
  return (
    <div>
      <ServerSection
        sectionType="members"
        label="Members"
      />
      <div className="flex flex-col gap-1">
        {
          !!members?.length && members.map(member => (
            <ServerMember key={member.id} member={member} serverId={serverId} />
          ))
        }
      </div>
    </div>
  )
}