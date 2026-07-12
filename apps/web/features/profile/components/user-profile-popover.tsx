"use client";

import { PresenceAvatar } from "@/features/presence/components/presence-avatar";
import { useWatchPresence } from "@/features/presence/presence-provider";
import { useOpenDm } from "@/features/conversation/hooks/use-conversations";
import { useFriendActions } from "@/features/friends/hooks/use-friends";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useAuth } from "@/shared/providers/auth-provider";
import { Link2, Loader2, MessageSquare, UserPlus } from "lucide-react";
import { useState } from "react";
import { useUserProfile } from "../hooks/profile-mutations";

interface UserProfilePopoverProps {
  userId: string;
  /** Display name to show instantly before the full profile loads. */
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
}

// Per-user accent is dynamic data (not a theme token), so inline styles are the
// sanctioned path — the profile editor / preview use the same treatment.
const FALLBACK_ACCENT = "#5865F2";

/**
 * Rich member profile card shown on click (chat avatar, member roster). Renders
 * the user's full profile — banner, accent, display name, @username, pronouns,
 * status, bio and links — fetched lazily the first time the card opens, with the
 * passed name/avatar as an instant fallback. Offers "Message" and "Add friend"
 * for everyone but yourself.
 */
export const UserProfilePopover = ({
  userId,
  name,
  username,
  avatarUrl,
  children,
}: UserProfilePopoverProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { sendRequestToUser } = useFriendActions();
  const openDm = useOpenDm();
  const { data: profile, isLoading } = useUserProfile(userId, open);
  const isSelf = user?.id === userId;

  // Subscribe presence only while the card is open.
  useWatchPresence(open ? [userId] : []);

  const accent = profile?.accentColor || FALLBACK_ACCENT;
  const displayName = profile?.displayName || name;
  const handle = profile?.username ?? username;
  const avatar = profile?.avatar || avatarUrl || undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 overflow-hidden p-0" align="start">
        {/* Banner */}
        <div
          className="h-20 w-full"
          style={
            profile?.banner
              ? undefined
              : { background: `linear-gradient(135deg, ${accent}, ${accent}80)` }
          }
        >
          {profile?.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.banner}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="-mt-10 mb-2">
            <span className="inline-block rounded-full bg-popover p-1">
              <PresenceAvatar
                userId={userId}
                src={avatar}
                className="h-16 w-16"
              />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold leading-tight">
              {displayName}
            </p>
            {profile?.pronouns && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {profile.pronouns}
              </span>
            )}
          </div>
          {handle && <p className="text-xs text-muted-foreground">@{handle}</p>}

          {profile?.status && (
            <div
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
              style={{ backgroundColor: `${accent}1f`, color: accent }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              {profile.status}
            </div>
          )}

          {profile?.bio && (
            <>
              <div className="my-3 h-px bg-border" />
              <p className="line-clamp-4 whitespace-pre-wrap text-sm text-foreground/90">
                {profile.bio}
              </p>
            </>
          )}

          {profile?.links && profile.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.links.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition hover:bg-accent"
                  style={{ borderColor: `${accent}66`, color: accent }}
                >
                  <Link2 className="h-3 w-3" />
                  {l.label || "link"}
                </a>
              ))}
            </div>
          )}

          {isLoading && !profile && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading profile…
            </div>
          )}

          {!isSelf && (
            <div className="mt-4 flex gap-2">
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
