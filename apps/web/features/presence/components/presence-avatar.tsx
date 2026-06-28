"use client";

import { UserAvatar } from "@/shared/components/user-avatar";
import { usePresence } from "../presence-store";
import { PresenceDot } from "./presence-dot";

interface PresenceAvatarProps {
  userId: string | undefined | null;
  src?: string;
  className?: string;
  /** Hide the dot entirely (e.g. when presence isn't relevant). */
  showStatus?: boolean;
}

/**
 * A {@link UserAvatar} with a live presence dot overlaid on the bottom-right.
 * Reads presence from the store, so it stays in sync as long as something has
 * subscribed to this user via `useWatchPresence`.
 */
export const PresenceAvatar = ({
  userId,
  src,
  className,
  showStatus = true,
}: PresenceAvatarProps) => {
  const { status } = usePresence(userId);

  return (
    <div className="relative shrink-0">
      <UserAvatar src={src} className={className} />
      {showStatus && (
        <PresenceDot
          status={status}
          ring
          className="absolute -bottom-0.5 -right-0.5"
        />
      )}
    </div>
  );
};
