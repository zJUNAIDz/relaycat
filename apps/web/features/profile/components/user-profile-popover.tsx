"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useOpenDm } from "@/features/conversation/hooks/use-conversations";
import { useFriendActions } from "@/features/friends/hooks/use-friends";
import { useAuth } from "@/shared/providers/auth-provider";
import { MessageSquare, UserPlus } from "lucide-react";

interface UserProfilePopoverProps {
  userId: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
}

/**
 * Lightweight member profile card shown on click (e.g. a chat avatar). Offers
 * "Add friend" and "Message" actions for users other than yourself.
 */
export const UserProfilePopover = ({
  userId,
  name,
  username,
  avatarUrl,
  children,
}: UserProfilePopoverProps) => {
  const { user } = useAuth();
  const { sendRequestToUser } = useFriendActions();
  const openDm = useOpenDm();
  const isSelf = user?.id === userId;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
        <div className="h-12 bg-primary/20" />
        <div className="px-4 pb-4">
          <div className="-mt-6 mb-2">
            <UserAvatar
              src={avatarUrl ?? undefined}
              className="h-14 w-14 border-4 border-background"
            />
          </div>
          <p className="font-semibold leading-tight">{name}</p>
          {username && (
            <p className="text-xs text-muted-foreground">@{username}</p>
          )}

          {!isSelf && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                disabled={openDm.isPending}
                onClick={() => openDm.mutate(userId)}
              >
                <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={sendRequestToUser.isPending}
                onClick={() => sendRequestToUser.mutate(userId)}
                title="Add friend"
              >
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
