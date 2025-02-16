// "use client"
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { ServerWithMembersWithUserProfiles } from "@/shared/types";
import { ServerSection } from "./server-section";

interface ServerMembersListProps {
  members: ServerWithMembersWithUserProfiles["members"]
}
export const ServerMembersList: React.FC<ServerMembersListProps> = async ({ members }) => {
  //TODO: fix this

  //* Impossible edge case
  if (!members?.length) return <div>No members</div>
  return (
    <div>
      <ServerSection
        sectionType="members"
        label="Members"
      />
      <div className="flex flex-col gap-4">
        {
          !!members?.length && members.map(member => (
            <div key={member.userId} className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={member.user.image}
                />
              </Avatar>
              <div className="text-sm">{member.user.name}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}