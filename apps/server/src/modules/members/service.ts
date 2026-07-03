import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { Member, members, MemberWithUser } from "@/db/schema/member";
import { servers } from "@/db/schema/server";
import { permissionService } from "@/services/permission.service";
import { ForbiddenError, NotFoundError } from "@/utils/errors";
import { and, asc, eq } from "drizzle-orm";

class MembersService {
  /**
   * Retrieves a member based on the provided member ID.
   * @param memberId  Id of the member to be retrieved
   * @returns Member object or null if not found
   */
  async getMemberById(memberId: Member["id"]) {
    try {
      const [member] = await db
        .select()
        .from(members)
        .where(eq(members.id, memberId))
        .limit(1);
      if (!member) {
        return null;
      }
      return member;
    } catch (err) {
      return null;
    }
  }

  /**
   * Retrieves a member based on the provided user ID.
   * @param userId  Id of the user whose member information is to be retrieved
   * @returns Member object or null if not found
   */
  async getMemberByUserId(userId: Member["userId"]) {
    try {
      const [member] = await db
        .select()
        .from(members)
        .where(eq(members.userId, userId))
        .limit(1);
      if (!member) {
        return null;
      }
      return member;
    } catch (err) {
      return null;
    }
  }
  /**
   *  Retrieves all members associated with a specific server ID.
   * @param serverId Id of the server whose members are to be retrieved
   * @returns List of members with their associated user information or null if none found
   */
  async getMembersByServerId(serverId: Member["serverId"]) {
    try {
      const membersList = await db
        .select()
        .from(members)
        .where(and(eq(members.serverId, serverId)))
        .leftJoin(user, eq(members.userId, user.id))
        .orderBy(asc(members.createdAt));

      const grouped = membersList.reduce(
        (acc, curr) => {
          const user = curr.user!;
          const member = curr.members;
          if (!acc[member.id]) {
            acc[member.id] = {
              ...member,
              user,
              roles: [],
            };
          }
          return acc;
        },
        {} as Record<string, MemberWithUser>,
      );
      const membersListUnique = Object.values(grouped);
      if (membersListUnique.length === 0) {
        return null;
      }

      // Attach each member's roles.
      const rolesByMember = await permissionService.getRolesForMembers(
        membersListUnique.map((m) => m.id),
      );
      for (const member of membersListUnique) {
        member.roles = rolesByMember.get(member.id) ?? [];
      }

      return membersListUnique;
    } catch (err) {
      return null;
    }
  }

  /**
   * Kicks a member from a server. Authorization (KICK_MEMBERS) is enforced by
   * requirePermission at the route; here we only guard the invariants: you
   * cannot kick yourself or the server owner.
   * @param memberId  Id of the member to remove
   * @param actingMemberId  The acting member's id (from memberContext)
   * @returns True on success
   */
  async kickMember(memberId: Member["id"], actingMemberId: Member["id"]) {
    if (memberId === actingMemberId) {
      throw new ForbiddenError("You cannot kick yourself");
    }

    const [target] = await db
      .select({ member: members, ownerId: servers.ownerId })
      .from(members)
      .innerJoin(servers, eq(servers.id, members.serverId))
      .where(eq(members.id, memberId))
      .limit(1);
    if (!target) {
      throw new NotFoundError("Member not found");
    }
    if (target.member.userId === target.ownerId) {
      throw new ForbiddenError("The server owner cannot be kicked");
    }

    const deleted = await db.delete(members).where(eq(members.id, memberId));
    return (deleted.rowCount ?? 0) > 0;
  }
}
export const membersService = new MembersService();
