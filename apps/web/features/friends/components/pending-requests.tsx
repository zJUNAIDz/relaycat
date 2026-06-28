"use client";

import { Button } from "@/shared/components/ui/button";
import { UserAvatar } from "@/shared/components/user-avatar";
import { Check, X } from "lucide-react";
import { useFriendActions, useFriendRequests } from "../hooks/use-friends";

export const PendingRequests = () => {
  const { data: requests, isLoading } = useFriendRequests();
  const { accept, decline, remove } = useFriendActions();

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading requests…</p>;

  if (!requests?.length)
    return (
      <p className="text-sm text-muted-foreground">No pending requests.</p>
    );

  return (
    <div className="space-y-1">
      {requests.map((r) => (
        <div
          key={r.friendshipId}
          className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <UserAvatar src={r.user.avatar ?? undefined} className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-sm font-medium">
                {r.user.displayName || r.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {r.direction === "incoming"
                  ? "Incoming request"
                  : "Outgoing request"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {r.direction === "incoming" ? (
              <>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title="Accept"
                  disabled={accept.isPending}
                  onClick={() => accept.mutate(r.friendshipId)}
                >
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title="Decline"
                  disabled={decline.isPending}
                  onClick={() => decline.mutate(r.friendshipId)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                disabled={remove.isPending}
                onClick={() => remove.mutate(r.user.userId)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};