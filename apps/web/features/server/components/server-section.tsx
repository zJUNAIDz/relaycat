"use client";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { useModal } from "@/shared/hooks/use-modal-store";
import { ChannelType, Server } from "@/shared/types";
import { Plus, Settings } from "lucide-react";

interface ServerSectionProps {
  server?: Server;
  label: string;
  /** MANAGE_CHANNELS — gates the "create channel" affordance. */
  canManageChannels?: boolean;
  /** KICK_MEMBERS/MANAGE_ROLES — gates the "manage members" affordance. */
  canManageMembers?: boolean;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
}

export const ServerSection: React.FC<ServerSectionProps> = ({
  label,
  canManageChannels,
  canManageMembers,
  sectionType,
  channelType,
}) => {
  const { onOpen } = useModal();

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-muted-foreground">
        {label}
      </p>
      {canManageChannels && sectionType === "channels" && (
        <ActionTooltip label="Create Channel" side="top" className="text-xs">
          <button
            onClick={() => onOpen("createChannel", { channelType })}
            className="text-muted-foreground hover:text-foreground  transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
      {canManageMembers && sectionType === "members" && (
        <ActionTooltip label="Manage Members" side="top" className="text-xs">
          <button
            onClick={() => onOpen("members")}
            className="text-muted-foreground hover:text-foreground  transition"
          >
            <Settings className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  );
};
