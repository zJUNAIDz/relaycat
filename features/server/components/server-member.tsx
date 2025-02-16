"use client"
import { RoleIcon } from "@/shared/components/icons";
import { UserAvatar } from "@/shared/components/user-avatar";
import { cn } from "@/shared/utils/cn";
import { Member, Server, User } from "@prisma/client"
import { useParams, useRouter } from "next/navigation";

interface ServerMemberProps {
  member: Member & { user: User };
  serverId: Server["id"];
}

export const ServerMember: React.FC<ServerMemberProps> = ({ member, serverId }) => {
  const params = useParams();
  const router = useRouter();
  const onClick = () => {
    router.push(`/servers/${serverId}/conversations/${member.id}`)
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full  haver:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params.memberId === member.id && "bg-zinc-70020 dark:bg-zinc-700"
      )}
    >
      <UserAvatar
        src={member.user.image}
        className="h-4 w-4 md:h-8 md:w-8"
      />
      <p
        className={cn(
          "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params.channelId === member.id && "text-primary dark:text-zinc-200"
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