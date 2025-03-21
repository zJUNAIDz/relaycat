"use client";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { useModal } from "@/shared/hooks/use-modal-store";
import { ChannelType, MemberRole, Server } from "@prisma/client";
import { Plus, Settings } from "lucide-react";

interface ServerSectionProps {
  server?: Server;
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
}

export const ServerSection: React.FC<ServerSectionProps> = ({ label, server, role, sectionType, channelType }) => {

  const { onOpen } = useModal();

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {role !== MemberRole.GUEST && sectionType === "channels" && (
        <ActionTooltip
          label="Create Channel"
          side="top"
          className="text-xs"
        >
          <button
            onClick={() => onOpen("createChannel", { channelType })}
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300  transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
      {
        role === MemberRole.ADMIN && sectionType === "members" && (
          <ActionTooltip
            label="Manage Members"
            side="top"
            className="text-xs"
          >
            <button
              onClick={() => onOpen("members")}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300  transition"
            >
              <Settings className="h-4 w-4" />
            </button>
          </ActionTooltip>
        )
      }
    </div>
  )
}