import { db } from "@/db";
import { members } from "@/db/schema/member";
import { memberRoles, roles } from "@/db/schema/role";
import {
  permissionService,
  type MemberContext,
} from "@/services/permission.service";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";
import {
  ALL_PERMISSIONS,
  parsePermissions,
  type CreateRoleInput,
  type Role as WireRole,
  type UpdateRoleInput,
} from "@repo/types";
import { and, asc, desc, eq } from "drizzle-orm";

type RoleRow = typeof roles.$inferSelect;

function toWire(row: RoleRow): WireRole {
  return { ...row, permissions: row.permissions.toString() };
}

/** The highest role position the actor holds (owner outranks everything). */
function highestPosition(ctx: MemberContext): number {
  if (ctx.isOwner) return Number.POSITIVE_INFINITY;
  return ctx.roles.reduce((max, r) => Math.max(max, r.position), 0);
}

class RolesService {
  async listRoles(serverId: string): Promise<WireRole[]> {
    const rows = await db
      .select()
      .from(roles)
      .where(eq(roles.serverId, serverId))
      .orderBy(desc(roles.position), asc(roles.createdAt));
    return rows.map(toWire);
  }

  /**
   * Reject granting permissions the actor does not themselves hold (owners and
   * ADMINISTRATORs implicitly hold everything).
   */
  private assertCanGrant(ctx: MemberContext, requested: bigint) {
    const allowed = ctx.isOwner ? ALL_PERMISSIONS : ctx.permissions;
    if ((requested & ~allowed) !== 0n) {
      throw new ForbiddenError("You cannot grant permissions you don't have");
    }
  }

  async createRole(
    serverId: string,
    ctx: MemberContext,
    input: CreateRoleInput,
  ): Promise<WireRole> {
    const requested = parsePermissions(input.permissions);
    this.assertCanGrant(ctx, requested);

    const [top] = await db
      .select({ position: roles.position })
      .from(roles)
      .where(eq(roles.serverId, serverId))
      .orderBy(desc(roles.position))
      .limit(1);
    const aboveAll = (top?.position ?? 0) + 1;

    // A new role must land strictly below the actor's own rank, otherwise a
    // MANAGE_ROLES holder could mint a role above themselves — one they could
    // then never manage, and which outranks the roles they're allowed to touch.
    // The owner is unbounded and simply gets the top slot.
    const actorRank = highestPosition(ctx);
    const position = ctx.isOwner ? aboveAll : Math.min(aboveAll, actorRank - 1);
    if (position < 1) {
      throw new ForbiddenError(
        "You need a role ranked above @everyone to create roles",
      );
    }

    const [row] = await db
      .insert(roles)
      .values({
        serverId,
        name: input.name,
        color: input.color ?? null,
        permissions: requested,
        position,
        isDefault: false,
      })
      .returning();
    return toWire(row);
  }

  private async getRoleInServer(
    serverId: string,
    roleId: string,
  ): Promise<RoleRow> {
    const [row] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.serverId, serverId)))
      .limit(1);
    if (!row) throw new NotFoundError("Role not found");
    return row;
  }

  /** You may only manage roles strictly below your own highest position. */
  private assertCanManage(ctx: MemberContext, role: RoleRow) {
    if (ctx.isOwner) return;
    if (role.position >= highestPosition(ctx)) {
      throw new ForbiddenError(
        "You cannot manage a role at or above your highest role",
      );
    }
  }

  async updateRole(
    serverId: string,
    roleId: string,
    ctx: MemberContext,
    input: UpdateRoleInput,
  ): Promise<WireRole> {
    const role = await this.getRoleInServer(serverId, roleId);
    this.assertCanManage(ctx, role);

    const patch: Partial<RoleRow> = { updatedAt: new Date() };
    if (input.name !== undefined) patch.name = input.name;
    if (input.color !== undefined) patch.color = input.color;
    if (input.permissions !== undefined) {
      const requested = parsePermissions(input.permissions);
      this.assertCanGrant(ctx, requested);
      patch.permissions = requested;
    }
    if (input.position !== undefined) {
      if (role.isDefault) {
        throw new BadRequestError("The @everyone role cannot be moved");
      }
      // Without this, the hierarchy is trivially escapable: create a role below
      // yourself, then re-position it above your own rank. Your rank rises with
      // it, and you can then assign yourself the (previously untouchable)
      // ADMINISTRATOR role. The new position must stay strictly below your rank.
      if (!ctx.isOwner && input.position >= highestPosition(ctx)) {
        throw new ForbiddenError(
          "You cannot move a role to or above your highest role",
        );
      }
      patch.position = input.position;
    }

    const [row] = await db
      .update(roles)
      .set(patch)
      .where(eq(roles.id, roleId))
      .returning();
    return toWire(row);
  }

  async deleteRole(serverId: string, roleId: string, ctx: MemberContext) {
    const role = await this.getRoleInServer(serverId, roleId);
    if (role.isDefault) {
      throw new BadRequestError("The @everyone role cannot be deleted");
    }
    this.assertCanManage(ctx, role);
    await db.delete(roles).where(eq(roles.id, roleId));
    return true;
  }

  /**
   * You may only change the roles of a member ranked strictly below you — otherwise
   * a moderator could strip roles from (or pile roles onto) an admin or a peer.
   */
  private async assertCanManageMember(ctx: MemberContext, memberId: string) {
    if (ctx.isOwner) return;
    const targetRank = await permissionService.getMemberRank(memberId);
    if (targetRank >= highestPosition(ctx)) {
      throw new ForbiddenError(
        "You cannot manage the roles of a member at or above your highest role",
      );
    }
  }

  private async assertMemberInServer(serverId: string, memberId: string) {
    const [member] = await db
      .select({ id: members.id })
      .from(members)
      .where(and(eq(members.id, memberId), eq(members.serverId, serverId)))
      .limit(1);
    if (!member) throw new NotFoundError("Member not found");
  }

  async assignRole(
    serverId: string,
    ctx: MemberContext,
    memberId: string,
    roleId: string,
  ) {
    const role = await this.getRoleInServer(serverId, roleId);
    this.assertCanManage(ctx, role);
    await this.assertMemberInServer(serverId, memberId);
    await this.assertCanManageMember(ctx, memberId);

    await db
      .insert(memberRoles)
      .values({ memberId, roleId })
      .onConflictDoNothing();
    return true;
  }

  async unassignRole(
    serverId: string,
    ctx: MemberContext,
    memberId: string,
    roleId: string,
  ) {
    const role = await this.getRoleInServer(serverId, roleId);
    if (role.isDefault) {
      throw new BadRequestError("The @everyone role cannot be removed");
    }
    this.assertCanManage(ctx, role);
    await this.assertMemberInServer(serverId, memberId);
    await this.assertCanManageMember(ctx, memberId);

    await db
      .delete(memberRoles)
      .where(
        and(eq(memberRoles.memberId, memberId), eq(memberRoles.roleId, roleId)),
      );
    return true;
  }
}

export const rolesService = new RolesService();
