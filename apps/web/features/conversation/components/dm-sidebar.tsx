"use client";

import { PresenceAvatar } from "@/features/presence/components/presence-avatar";
import { useWatchPresence } from "@/features/presence/presence-provider";
import { cn } from "@/shared/utils/cn";
import { Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFriendRealtime } from "@/features/friends/hooks/use-friends";
import { useDmChannels } from "../hooks/use-conversations";

/**
 * Left rail for the DM home: a "Friends" link plus the list of open DM
 * conversations. Mirrors the server sidebar but for direct messages.
 */
export const DmSidebar = () => {
  const { data: channels } = useDmChannels();
  const params = useParams();
  const activeId = params?.channelId as string | undefined;
  // Keep the DM/friends data fresh from server events.
  useFriendRealtime();
  // Live presence for everyone we have an open DM with.
  useWatchPresence((channels ?? []).map((c) => c.otherUser.userId));

  return (
    <div className="flex h-full w-full flex-col bg-muted/40">
      <div className="px-3 py-4">
        <Link
          href="/channels/me"
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition hover:bg-muted",
            !activeId && "bg-muted",
          )}
        >
          <Users className="h-4 w-4" /> Friends
        </Link>
      </div>

      <div className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">
        Direct Messages
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {channels?.map((c) => (
          <Link
            key={c.id}
            href={`/channels/me/${c.id}`}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-muted",
              activeId === c.id && "bg-muted",
            )}
          >
            <PresenceAvatar
              userId={c.otherUser.userId}
              src={c.otherUser.avatar ?? undefined}
              className="h-7 w-7"
            />
            <span className="truncate">
              {c.otherUser.displayName ||
                c.otherUser.username ||
                c.otherUser.name}
            </span>
          </Link>
        ))}
        {channels?.length === 0 && (
          <p className="px-2 py-1 text-xs text-muted-foreground">
            No conversations yet.
          </p>
        )}
      </div>
    </div>
  );
};
