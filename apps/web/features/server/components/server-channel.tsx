"use client";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { useModal } from "@/shared/hooks/use-modal-store";
import { cn } from "@/shared/utils/cn";
import { Channel, ChannelType, MemberRole, Server } from "@/shared/types";
import { Edit, Hash, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}
const channelIconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
}
export const ServerChannel: React.FC<ServerChannelProps> = ({ channel, server, role }) => {
  const router = useRouter();
  const params = useParams();
  const { onOpen } = useModal()

  const Icon = channelIconMap[channel.type];

  const onEditChannel = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    onOpen("editChannel", { server, channel });
  }
  const onDeleteChannel = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    onOpen("deleteChannel", { server, channel });
  }
  const onChannelClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    router.push(`/channels/${server.id}/${channel.id}`);
  }

  return (
    <button
      onClick={onChannelClick}
      className={cn(
        "group px-2 py-1.5 rounded-md flex items-center gap-x-2 w-full hover:bg-accent transition mb-1",
        params.channelId == channel.id && "bg-accent"
      )}
    >
      <Icon className="shrink-0 w-5 h-5 text-muted-foreground" />
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-muted-foreground group-hover:text-foreground transition",
          params.channelId == channel.id && "text-foreground"
        )}
      >
        {channel.name}
      </p>
      {
        channel.name !== "general" && role !== MemberRole.GUEST && (
          <div
            className="ml-auto flex items-center gap-x-2"
          >
            <ActionTooltip label="Edit channel" side="top" className="text-xs">
              <Edit onClick={onEditChannel} className="hidden group-hover:block w-4 h-4 text-muted-foreground hover:text-foreground" />
            </ActionTooltip>
            <ActionTooltip label="Delete channel" side="top" className="text-xs">
              <Trash onClick={onDeleteChannel} className="hidden group-hover:block w-4 h-4 text-muted-foreground hover:text-destructive" />
            </ActionTooltip>
          </div>
        )
      }
    </button>
  )
}