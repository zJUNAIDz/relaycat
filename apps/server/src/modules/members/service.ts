import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import {
  Member,
  MemberRole,
  members,
  MemberWithUser,
} from "@/db/schema/member";
import { and, asc, eq, ne, or } from "drizzle-orm";

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
        .orderBy(asc(members.role));

      const grouped = membersList.reduce(
        (acc, curr) => {
          const user = curr.user;
          const member = curr.members;
          if (!acc[member.id]) {
            acc[member.id] = {
              ...member,
              user: [],
            };
          }
          if (user) acc[member.id].user.push(user);
          return acc;
        },
        {} as Record<string, MemberWithUser>,
      );
      const membersListUnique = Object.values(grouped);
      if (membersListUnique.length === 0) {
        return null;
      }
      return membersListUnique;
    } catch (err) {
      return null;
    }
  }


/**
 * Deletes a member from a server based on the provided member ID.
 * @param memberId  Id of the member to be deleted
 * @param currentUserId  Id of the user making the deletion request
 * @returns  True if deletion is successful, false otherwise
 */
  async deleteMemberById(memberId: Member["id"], currentUserId: string) {
    try {
      const success = await db.transaction(async (tx) => {
        const currentUserMember = await tx
          .select()
          .from(members)
          .where(
            and(
              eq(members.userId, currentUserId),
              or(
                eq(members.role, MemberRole.ADMIN),
                eq(members.role, MemberRole.MODERATOR),
              ),
            ),
          )
          .limit(1);
        if (currentUserMember.length === 0) {
          // throw new Error("Member not found or unauthorized");
          return false;
        }
        const deleteCount = await tx
          .delete(members)
          .where(
            and(eq(members.id, memberId), ne(members.userId, currentUserId)),
          );
        if (deleteCount.rowCount === 0) {
          return false;
        }
        return true;
      });
      if (!success) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  /**
   * This method changes the role of a member in a server.
   * @param memberId Id of the member whose role is to be changed
   * @param userId  Id of the user making the change
   * @param role  New role to be assigned to the member
   * @returns Updated member object or null if operation fails
   */
  async changeMemberRole(
    memberId: Member["id"],
    userId: string,
    role: Member["role"],
  ) {
    try {
      const updatedMember = await db.transaction(async (tx) => {
        const currentUserMember = await tx
          .select()
          .from(members)
          .where(
            and(eq(members.userId, userId), eq(members.role, MemberRole.ADMIN)),
          )
          .limit(1);
        if (currentUserMember.length === 0) {
          // throw new Error("Member not found or unauthorized");
          return null;
        }
        const updatedMember = await tx
          .update(members)
          .set({ role })
          .where(
            and(
              eq(members.id, memberId),
              ne(members.userId, userId),
              or(
                eq(members.role, MemberRole.MODERATOR),
                eq(members.role, MemberRole.MEMBER),
              ),
            ),
          )
          .returning();
        return updatedMember[0];
      });
      return updatedMember;
    } catch (err) {
      return null;
    }
  }
  /**
   * Transfers ownership of a server from the current owner to a new owner.
   * @param currentOwnerMemberId Id of the current owner member
   * @param currentUserId Id of the user making the transfer
   * @param newOwnerMemberId Id of the new owner member
   * @returns Updated member object or null if operation fails
   */
  async ownershipTransfer(
    currentOwnerMemberId: Member["id"],
    currentUserId: string,
    newOwnerMemberId: string,
  ) {
    try {
      const transferredMember = await db.transaction(async (tx) => {
        const currentUserMember = await tx
          .select()
          .from(members)
          .where(
            and(
              eq(members.userId, currentUserId),
              eq(members.role, MemberRole.ADMIN),
            ),
          )
          .limit(1);
        if (currentUserMember.length === 0) {
          // throw new Error("Member not found or unauthorized");
          return null;
        }
        await tx
          .update(members)
          .set({ role: MemberRole.MEMBER })
          .where(eq(members.id, currentOwnerMemberId));
        const [updatedNewOwnerMember] = await tx
          .update(members)
          .set({ role: MemberRole.ADMIN })
          .where(
            and(
              eq(members.id, newOwnerMemberId),
              ne(members.userId, currentUserId),
            ),
          )
          .returning();
        return updatedNewOwnerMember;
      });
      return transferredMember;
    } catch (err) {
      return null;
    }
  }
}
export const membersService = new MembersService();
