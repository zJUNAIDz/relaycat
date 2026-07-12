"use client";

import { useAuth } from "@/shared/stores/use-auth";
import {
  ALL_PERMISSIONS,
  hasPermission,
  parsePermissions,
  Permission,
  type Role,
} from "@repo/types";
import { useMemo } from "react";

export { Permission } from "@repo/types";

/** Minimal shape needed to evaluate a member's permissions on the client. */
type ServerLike = {
  ownerId: string;
  members?: Array<{ userId: string; roles?: Role[] }>;
};

/**
 * OR together a member's role permissions. The server owner and any
 * ADMINISTRATOR-holder implicitly resolve to every permission.
 *
 * This mirrors the server's `permissionService` — the client uses it purely to
 * gate UI; the server remains the authority on every mutation.
 */
export function computePermissions(
  roles: Role[] | undefined,
  isOwner: boolean,
): bigint {
  if (isOwner) return ALL_PERMISSIONS;
  return (roles ?? []).reduce(
    (acc, role) => acc | parsePermissions(role.permissions),
    0n,
  );
}

export type PermissionState = {
  isOwner: boolean;
  permissions: bigint;
  /** Whether the current user satisfies a required permission flag. */
  can: (flag: bigint) => boolean;
};

/**
 * Resolve the current user's effective permissions within `server`. Recomputes
 * only when the server roster or the signed-in user changes.
 */
export function usePermissions(server?: ServerLike | null): PermissionState {
  const user = useAuth((s) => s.user);

  return useMemo(() => {
    const isOwner = !!server && !!user && server.ownerId === user.id;
    const me = server?.members?.find((m) => m.userId === user?.id);
    const permissions = computePermissions(me?.roles, isOwner);
    return {
      isOwner,
      permissions,
      can: (flag: bigint) => hasPermission(permissions, flag),
    };
  }, [server, user]);
}

/** The highest-position, non-default role — used to render a member's badge. */
export function primaryRole(roles: Role[] | undefined): Role | null {
  if (!roles || roles.length === 0) return null;
  const ranked = [...roles]
    .filter((r) => !r.isDefault)
    .sort((a, b) => b.position - a.position);
  return ranked[0] ?? null;
}
