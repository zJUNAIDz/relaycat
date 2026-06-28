"use client"
import { PresenceAvatar } from "@/features/presence/components/presence-avatar";
import { RoleIcon } from "@/shared/components/icons";
import { Server, ServerWithMembersAndUser } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { useParams, useRouter } from "next/navigation";

interface ServerMemberProps {
  member: ServerWithMembersAndUser["members"][number];
  serverId: Server["id"];
  // profileId: User["id"];
}

export const ServerMember: React.FC<ServerMemberProps> = ({ member, serverId }) => {
  const params = useParams();
  const router = useRouter();
  // const onClick = () => {
  //   if (member.user.id !== profileId)
  //     router.push(`/servers/${serverId}/conversations/${member.id}`)
  // }
  return (
    <button
      // onClick={onClick}
      className={cn(
        "group px-2 py-1.5 rounded-md flex items-center gap-x-2 w-full hover:bg-accent transition mb-1",
        params.memberId === member.id && "bg-accent",
        // member.user.id === profileId && "cursor-default"
      )}
    >
      <PresenceAvatar
        userId={member.user.id}
        src={member.user.image ?? undefined}
        className="h-4 w-4 md:h-8 md:w-8"
      />
      <p
        className={cn(
          "font-semibold text-sm text-muted-foreground group-hover:text-foreground transition",
          params.memberId === member.id && "text-foreground"
        )}
      >
        {member.user.name}
      </p>
      <RoleIcon
        className="ml-auto"
        role={member.role} />
    </button>
  )
}