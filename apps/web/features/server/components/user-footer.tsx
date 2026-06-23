"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useMyProfile } from "@/features/profile/hooks/profile-mutations";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { Link2, Pencil } from "lucide-react";
import Link from "next/link";

interface UserFooterProps {
  user: {
    name?: string;
    username?: string;
    image?: string | null;
  };
}

const FALLBACK_ACCENT = "#5865F2";

export const UserFooter = ({ user }: UserFooterProps) => {
  // Pull the rich profile so the footer popover shows the custom avatar/banner
  // and flair, falling back to the auth identity while it loads.
  const { data: profile } = useMyProfile();

  const avatar = profile?.avatar || user?.image || undefined;
  const displayName = profile?.displayName || user.name || "User";
  const accent = profile?.accentColor || FALLBACK_ACCENT;

  return (
    <div className="w-full flex p-1 h-14 bg-background/50 dark:bg-background/10 border-t border-neutral-200 dark:border-neutral-800">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex justify-center items-center gap-2 hover:bg-accent p-2 py-3 rounded-md cursor-pointer">
            <UserAvatar src={avatar} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{displayName}</span>
              <span className="text-xs text-gray-500 overflow-clip">
                @{user.username}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="ml-10 p-0 w-80 overflow-hidden">
          {/* Banner */}
          <div
            className="relative h-20"
            style={
              profile?.banner
                ? undefined
                : {
                    background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
                  }
            }
          >
            {profile?.banner && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.banner}
                alt="banner"
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute -bottom-7 left-4 rounded-full bg-popover p-1">
              <UserAvatar src={avatar} className="h-14 w-14 md:h-14 md:w-14" />
            </div>
          </div>

          <div className="px-4 pb-4 pt-9">
            <div className="flex items-center gap-2">
              <span className="font-bold">{displayName}</span>
              {profile?.pronouns && (
                <span className="text-xs text-muted-foreground">
                  {profile.pronouns}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">@{user.username}</p>

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
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                {profile.bio}
              </p>
            )}

            {profile?.links && profile.links.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs hover:underline"
                    style={{ borderColor: `${accent}66`, color: accent }}
                  >
                    <Link2 className="h-3 w-3" />
                    {l.label}
                  </a>
                ))}
              </div>
            )}

            <Link
              href={PAGE_ROUTES.PROFILE_EDIT}
              className="mt-4 flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition hover:bg-accent"
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
