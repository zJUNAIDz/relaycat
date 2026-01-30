"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useModal } from "@/shared/hooks/use-modal-store";
import { ServerWithMembersAndUser } from "@/shared/types";
import { MemberRole } from "@/generated/prisma/client";
import {
  ChevronDown,
  DoorOpen,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";
import React from "react";

interface ServerHeaderProps {
  server: ServerWithMembersAndUser;
  role?: MemberRole;
}
//TODO: Replace icons with discord icons or more unique ones
const ServerHeader: React.FC<ServerHeaderProps> = ({ server, role }) => {
  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = role === MemberRole.MODERATOR;

  const { onOpen } = useModal();

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" asChild>
          <button className="w-full text-md font-semibold px-3 flex items-center h-12  border-neutral-200  dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10  dark:hover:bg-zinc-700/50 transition">
            {server.name}
            <ChevronDown className="h-5 w-5 ml-auto" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-0.5 ">
          <DropdownMenuItem
            onClick={() => onOpen("invite", { server })}
            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
          >
            Invite People <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
          {
            isAdmin && (
              <DropdownMenuItem
                onClick={() => onOpen("editServer", { server })}
                className="px-3 py-2 text-sm cursor-pointer"
              >
                Server Settings <Settings className="h-4 w-4 ml-auto" />
              </DropdownMenuItem>
            )
          }
          {
            (isAdmin || isModerator) && (
              <DropdownMenuItem
                onClick={() => onOpen("members", { server })}
                className="px-3 py-2 text-sm cursor-pointer"
              >
                Manage Members <Users className="h-4 w-4 ml-auto" />
              </DropdownMenuItem>
            )
          }
          {
            (isAdmin || isModerator) && (
              <DropdownMenuItem
                onClick={() => onOpen("createChannel")}
                className="px-3 py-2 text-sm cursor-pointer"
              >
                Create Channel <PlusCircle className="h-4 w-4 ml-auto" />
              </DropdownMenuItem>
            )
          }
          {
            (isAdmin || isModerator) && (
              <DropdownMenuSeparator className="h-1" />
            )
          }
          {!isAdmin && (
            <DropdownMenuItem
              className="text-rose-600 dark:text-red-400 px-3 py-2 text-sm cursor-pointer"
              onClick={() => onOpen("leaveServer", { server })}
            >
              Leave Server <DoorOpen className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          )
          }
          {
            isAdmin && (
              <DropdownMenuItem
                className="text-rose-600 dark:text-red-400 px-3 py-2 text-sm cursor-pointer"
                onClick={() => onOpen("deleteServer", { server })}
              >
                Delete Server <Trash className="h-4 w-4 ml-auto" />
              </DropdownMenuItem>
            )
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ServerHeader;
