"use client";

import { Button } from "@/shared/components/ui/button";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useOpenDm } from "@/features/conversation/hooks/use-conversations";
import { MessageSquare, UserMinus } from "lucide-react";
import { useFriendActions, useFriends } from "../hooks/use-friends";

export const FriendsList = () => {
  const { data: friends, isLoading } = useFriends();
  const { remove } = useFriendActions();
  const openDm = useOpenDm();

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
        <div
          key={f.userId}
          className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <UserAvatar src={f.avatar ?? undefined} className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-sm font-medium">{f.displayName || f.name}</p>
              {f.username && (
                <p className="text-xs text-muted-foreground">@{f.username}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              title="Message"
              disabled={openDm.isPending}
              onClick={() => openDm.mutate(f.userId)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              title="Remove friend"
              disabled={remove.isPending}
              onClick={() => remove.mutate(f.userId)}
            >
              <UserMinus className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
