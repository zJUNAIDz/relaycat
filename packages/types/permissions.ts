// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------
// A bitfield permission model (Discord-style). Each flag is a single capability
// the server enforces. Permissions are stored on roles as a Postgres `bigint`
// (63 usable bits) and a member's *effective* permissions are the bitwise OR of
// all roles assigned to them (the server owner implicitly has every flag).
//
// To add a new capability: append one flag below. Nothing else in the
// permission machinery (compute/check/serialize) needs to change.
//
// NOTE ON TRANSPORT: JSON cannot represent `bigint`, so permissions cross the
// wire as decimal strings. Use {@link parsePermissions} to get a `bigint` for
// bitwise math and {@link serializePermissions} to put one back on the wire.

export const Permission = {
  /** Implicit grant of every permission; bypasses all checks. */
  ADMINISTRATOR: 1n << 0n,
  /** Edit/delete server settings (name, image, etc.). */
  MANAGE_SERVER: 1n << 1n,
  /** Create, edit, delete, and assign roles. */
  MANAGE_ROLES: 1n << 2n,
  /** Create, edit, and delete channels. */
  MANAGE_CHANNELS: 1n << 3n,
  /** Remove members from the server. */
  KICK_MEMBERS: 1n << 4n,
  /** Regenerate/share the invite code. */
  CREATE_INVITE: 1n << 5n,
  /** Delete or edit messages authored by other members. */
  MANAGE_MESSAGES: 1n << 6n,
  /** Send messages in channels. */
  SEND_MESSAGES: 1n << 7n,
  /** View the server and its channels. */
  VIEW_SERVER: 1n << 8n,
} as const;

export type PermissionFlag = keyof typeof Permission;

/** Every flag OR'd together — what the server owner / ADMINISTRATOR resolve to. */
export const ALL_PERMISSIONS: bigint = Object.values(Permission).reduce(
  (acc, flag) => acc | flag,
  0n,
);

/** Baseline permissions granted to everyone via the default (@everyone) role. */
export const DEFAULT_PERMISSIONS: bigint =
  Permission.VIEW_SERVER | Permission.SEND_MESSAGES | Permission.CREATE_INVITE;

/**
 * Check whether a (combined) permission bitfield satisfies a required flag.
 * `ADMINISTRATOR` is treated as an implicit grant of everything.
 */
export function hasPermission(permissions: bigint, required: bigint): boolean {
  if ((permissions & Permission.ADMINISTRATOR) === Permission.ADMINISTRATOR) {
    return true;
  }
  return (permissions & required) === required;
}

/** OR a set of flags into a single bitfield. */
export function combinePermissions(...flags: bigint[]): bigint {
  return flags.reduce((acc, flag) => acc | flag, 0n);
}

/** bigint -> decimal string for JSON transport. */
export function serializePermissions(permissions: bigint): string {
  return permissions.toString();
}

/** decimal string|number|bigint -> bigint for bitwise math. */
export function parsePermissions(value: string | number | bigint): bigint {
  return BigInt(value);
}

/**
 * Presentational metadata for each permission flag — drives the role editor's
 * permission toggles so the UI stays in lockstep with the flag list.
 */
export const PERMISSION_DETAILS: ReadonlyArray<{
  key: PermissionFlag;
  label: string;
  description: string;
}> = [
  {
    key: "ADMINISTRATOR",
    label: "Administrator",
    description:
      "Grants every permission and bypasses all checks. Assign with care.",
  },
  {
    key: "MANAGE_SERVER",
    label: "Manage Server",
    description: "Edit the server's name, image, and other settings.",
  },
  {
    key: "MANAGE_ROLES",
    label: "Manage Roles",
    description: "Create, edit, delete, and assign roles below your own.",
  },
  {
    key: "MANAGE_CHANNELS",
    label: "Manage Channels",
    description: "Create, edit, and delete channels.",
  },
  {
    key: "KICK_MEMBERS",
    label: "Kick Members",
    description: "Remove members from the server.",
  },
  {
    key: "CREATE_INVITE",
    label: "Create Invite",
    description: "Regenerate and share the server invite code.",
  },
  {
    key: "MANAGE_MESSAGES",
    label: "Manage Messages",
    description: "Delete or edit messages sent by other members.",
  },
  {
    key: "SEND_MESSAGES",
    label: "Send Messages",
    description: "Send messages in the server's channels.",
  },
  {
    key: "VIEW_SERVER",
    label: "View Server",
    description: "View the server and its channels.",
  },
];
