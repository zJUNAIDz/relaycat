"use client";

import { UserAvatar } from "@/shared/components/user-avatar";
import { cn } from "@/shared/utils/cn";
import type { ProfileLink } from "@repo/types";
import { Link2 } from "lucide-react";

interface ProfilePreviewProps {
  displayName: string;
  username: string;
  bio: string;
  pronouns: string;
  status: string;
  accentColor: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  links: ProfileLink[];
}

const FALLBACK_ACCENT = "#5865F2";

/**
 * A Discord-style live card mirroring the form state in real time, so the user
 * sees exactly what their profile will look like as they edit.
 */
export const ProfilePreview = ({
  displayName,
  username,
  bio,
  pronouns,
  status,
  accentColor,
  avatarUrl,
  bannerUrl,
  links,
}: ProfilePreviewProps) => {
  const accent = accentColor || FALLBACK_ACCENT;

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Banner */}
      <div
        className="relative h-28"
        style={
          bannerUrl
            ? undefined
            : { background: `linear-gradient(135deg, ${accent}, ${accent}80)` }
        }
      >
        {bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt="banner"
            className="h-full w-full object-cover"
          />
        )}
        <div
          className="absolute -bottom-9 left-5 rounded-full p-1"
          style={{ backgroundColor: "var(--card)" }}
        >
          <UserAvatar
            src={avatarUrl || undefined}
            className="h-20 w-20 border-4 md:h-20 md:w-20"
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-12">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-lg font-bold">
            {displayName || username || "Your name"}
          </h3>
          {pronouns && (
            <span className="text-xs text-muted-foreground">{pronouns}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">@{username}</p>

        {status && (
          <div
            className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            {status}
          </div>
        )}

        {bio && (
          <>
            <div className="my-3 h-px bg-border" />
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {bio}
            </p>
          </>
        )}

        {links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map((l, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs",
                )}
                style={{ borderColor: `${accent}66`, color: accent }}
              >
                <Link2 className="h-3 w-3" />
                {l.label || "link"}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
