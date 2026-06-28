"use client";

import type { PresenceStatus } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { STATUS_META } from "../status-meta";

interface PresenceDotProps {
  status: PresenceStatus;
  className?: string;
  /** Draw a ring matching the surrounding surface (for avatar overlays). */
  ring?: boolean;
}

/** A small colored status dot. */
export const PresenceDot = ({ status, className, ring }: PresenceDotProps) => (
  <span
    title={STATUS_META[status].label}
    className={cn(
      "block h-3 w-3 rounded-full",
      STATUS_META[status].dot,
      ring && "ring-2 ring-background",
      className,
    )}
  />
);
