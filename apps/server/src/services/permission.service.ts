import { db } from "@/db";
import { memberRoles, roles } from "@/db/schema/role";
import { members } from "@/db/schema/member";
import { servers } from "@/db/schema/server";
import { NotFoundError } from "@/utils/errors";
import { ALL_PERMISSIONS, hasPermission, type Role } from "@repo/types";
import { and, eq, inArray } from "drizzle-orm";

/**
 * The authorization context for a (user, server) pair — resolved once per
 * request by the {@link requirePermission} middleware and stashed on the Hono
 * context so services never re-query membership/roles.
 */
export type MemberContext = {
  memberId: string;
  userId: string;
  serverId: string;
  /** True when the user owns the server; owners bypass every permission check. */
  isOwner: boolean;
  /** Effective permissions = OR of all assigned roles (owner ⇒ ALL). */
  permissions: bigint;
  /** The member's roles as decimal-string-serialisable rows. */
  roles: Role[];
};

/** Map a DB role row (bigint permissions) to the wire {@link Role} shape. */
function toWireRole(row: typeof roles.$inferSelect): Role {
  return { ...row, permissions: row.permissions.toString() };
}

class PermissionService {
  /**
   * Resolve the effective permission context for a user within a server.
   * Throws {@link NotFoundError} when the user is not a member (so callers
   * can't distinguish "no access" from "no such server" — 404, not 403).
   */
  async getContext(userId: string, serverId: string): Promise<MemberContext> {
    const [member] = await db
      .select()
      .from(members)
      .where(and(eq(members.userId, userId), eq(members.serverId, serverId)))
      .limit(1);
    if (!member) {
      throw new NotFoundError("Server not found");
    }

    const [server] = await db
      .select({ ownerId: servers.ownerId })
      .from(servers)
      .where(eq(servers.id, serverId))
      .limit(1);
    const isOwner = server?.ownerId === userId;

    const memberRoleRows = await db
      .select({ role: roles })
      .from(memberRoles)
      .innerJoin(roles, eq(roles.id, memberRoles.roleId))
      .where(eq(memberRoles.memberId, member.id));

    const roleRows = memberRoleRows.map((r) => r.role);
    const permissions = isOwner
      ? ALL_PERMISSIONS
      : roleRows.reduce((acc, r) => acc | r.permissions, 0n);

    return {
      memberId: member.id,
      userId,
      serverId,
      isOwner,
      permissions,
      roles: roleRows.map(toWireRole),
    };
  }

  /** Whether an already-resolved context satisfies a required flag. */
  can(ctx: MemberContext, required: bigint): boolean {
    return ctx.isOwner || hasPermission(ctx.permissions, required);
  }

  /**
   * The rank of a member — their highest role position, with the server owner
   * outranking everyone (+∞). Hierarchy rules compare ranks: you may only act on
   * members and roles *strictly below* your own rank.
   *
   * Members with no roles rank 0, the same as @everyone.
   */
  async getMemberRank(memberId: string): Promise<number> {
    const [row] = await db
      .select({ userId: members.userId, ownerId: servers.ownerId })
      .from(members)
      .innerJoin(servers, eq(servers.id, members.serverId))
      .where(eq(members.id, memberId))
      .limit(1);
    if (!row) throw new NotFoundError("Member not found");
    if (row.userId === row.ownerId) return Number.POSITIVE_INFINITY;

    const rows = await db
      .select({ position: roles.position })
      .from(memberRoles)
      .innerJoin(roles, eq(roles.id, memberRoles.roleId))
      .where(eq(memberRoles.memberId, memberId));

    return rows.reduce((max, r) => Math.max(max, r.position), 0);
  }

  /** The acting member's own rank (owner ⇒ +∞). */
  rankOf(ctx: MemberContext): number {
    if (ctx.isOwner) return Number.POSITIVE_INFINITY;
    return ctx.roles.reduce((max, r) => Math.max(max, r.position), 0);
  }

  /**
   * Batch-load roles for a set of members (for roster payloads). Returns a map
   * of memberId -> wire roles so callers can attach `roles` to each member.
   */
  async getRolesForMembers(memberIds: string[]): Promise<Map<string, Role[]>> {
    const map = new Map<string, Role[]>();
    if (memberIds.length === 0) return map;

    const rows = await db
      .select({ memberId: memberRoles.memberId, role: roles })
      .from(memberRoles)
      .innerJoin(roles, eq(roles.id, memberRoles.roleId))
      .where(inArray(memberRoles.memberId, memberIds));

    for (const { memberId, role } of rows) {
      const list = map.get(memberId) ?? [];
      list.push(toWireRole(role));
      map.set(memberId, list);
    }
    return map;
  }
}

export const permissionService = new PermissionService();
