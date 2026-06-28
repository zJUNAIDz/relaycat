"use client";

import { Button } from "@/shared/components/ui/button";
import { useOpenDm } from "@/features/conversation/hooks/use-conversations";
import { PresenceAvatar } from "@/features/presence/components/presence-avatar";
import { useWatchPresence } from "@/features/presence/presence-provider";
import { usePresence } from "@/features/presence/presence-store";
import { STATUS_META } from "@/features/presence/status-meta";
import { MessageSquare, UserMinus } from "lucide-react";
import { useFriendActions, useFriends } from "../hooks/use-friends";

export const FriendsList = () => {
  const { data: friends, isLoading } = useFriends();
  const { remove } = useFriendActions();
  const openDm = useOpenDm();

  // Subscribe to live presence for every friend we render.
  useWatchPresence((friends ?? []).map((f) => f.userId));

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading friends…</p>;

  if (!friends?.length)
    return (
      <p className="text-sm text-muted-foreground">
        No friends yet — add some from the “Add friend” tab.
      </p>
    );

  return (
    <div className="space-y-1">
      {friends.map((f) => (
        <FriendRow
          key={f.userId}
          userId={f.userId}
          avatar={f.avatar}
          name={f.displayName || f.name}
          username={f.username}
          onMessage={() => openDm.mutate(f.userId)}
          messageDisabled={openDm.isPending}
          onRemove={() => remove.mutate(f.userId)}
          removeDisabled={remove.isPending}
        />
      ))}
    </div>
  );
};

interface FriendRowProps {
  userId: string;
  avatar: string | null;
  name: string;
  username: string | null;
  onMessage: () => void;
  messageDisabled: boolean;
  onRemove: () => void;
  removeDisabled: boolean;
}

const FriendRow = ({
  userId,
  avatar,
  name,
  username,
  onMessage,
  messageDisabled,
  onRemove,
  removeDisabled,
}: FriendRowProps) => {
  const { status } = usePresence(userId);

  return (
    <div className="flex items-center justify-between rounded-md p-2 hover:bg-muted">
      <div className="flex items-center gap-2">
        <PresenceAvatar userId={userId} src={avatar ?? undefined} className="h-8 w-8" />
        <div className="leading-tight">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            {username ? `@${username} · ` : ""}
            {STATUS_META[status].label}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          title="Message"
          disabled={messageDisabled}
          onClick={onMessage}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="Remove friend"
          disabled={removeDisabled}
          onClick={onRemove}
        >
          <UserMinus className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
