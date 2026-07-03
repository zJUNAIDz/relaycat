import { cn } from "@/shared/utils/cn";
import { primaryRole } from "@/shared/lib/permissions";
import type { Role } from "@repo/types";
import React from "react";

interface RoleBadgeProps {
  /** All of a member's roles; the highest non-default one is shown. */
  roles: Role[] | undefined;
  className?: string;
  /** Render just the colored dot (no label). */
  dotOnly?: boolean;
}

/**
 * Renders a member's primary role as a colored chip. Replaces the old
 * image-based RoleIcon (which was keyed on the removed ADMIN/MODERATOR/GUEST
 * enum). Returns null when the member only has the default @everyone role.
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({
  roles,
  className,
  dotOnly,
}) => {
  const role = primaryRole(roles);
  if (!role) return null;
  const color = role.color ?? "#99aab5";

  if (dotOnly) {
    return (
      <span
        className={cn("inline-block h-2.5 w-2.5 rounded-full", className)}
        style={{ backgroundColor: color }}
        title={role.name}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        className,
      )}
      style={{ color, backgroundColor: `${color}1a` }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {role.name}
    </span>
  );
};
