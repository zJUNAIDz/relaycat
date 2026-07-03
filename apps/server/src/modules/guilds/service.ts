import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { channels, ChannelType } from "@/db/schema/channel";
import { members } from "@/db/schema/member";
import { memberRoles, roles } from "@/db/schema/role";
import {
  ServerInput,
  servers,
  ServerWithMembersAndUsersAndChannels,
  type Server,
} from "@/db/schema/server";
import { toMediaPath } from "@/utils/media";
import { applyProfileToUser, profileService } from "@/services/profile.service";
import { permissionService } from "@/services/permission.service";
import { DEFAULT_PERMISSIONS } from "@repo/types";
import { and, eq, inArray, notExists } from "drizzle-orm";

/** Insert the default @everyone role for a freshly created server. */
async function seedDefaultRole(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  serverId: string,
) {
  const [everyone] = await tx
    .insert(roles)
    .values({
      serverId,
      name: "@everyone",
      permissions: DEFAULT_PERMISSIONS,
      position: 0,
      isDefault: true,
    })
    .returning();
  return everyone;
}

class ServersService {
  async createServer(
    userId: string,
    // ownerId is injected here from the authenticated user, not the request.
    serverData: Omit<ServerInput, "ownerId">,
  ): Promise<Server | null> {
    try {
      const server: ServerWithMembersAndUsersAndChannels | null = await db
        .transaction(async (tx) => {
          let server: ServerWithMembersAndUsersAndChannels | null = null;
          const [newServer] = await tx
            .insert(servers)
            .values({
              ...serverData,
              image: toMediaPath(serverData.image),
              ownerId: userId,
            })
            .returning();
          const [channel] = await tx
            .insert(channels)
            .values({
              name: "general",
              serverId: newServer.id,
              type: ChannelType.TEXT,
            })
            .returning();
          // Seed the default @everyone role and enrol the owner into it.
          const everyone = await seedDefaultRole(tx, newServer.id);
          const [member] = await tx
            .insert(members)
            .values({
              userId,
              serverId: newServer.id,
            })
            .returning();
          await tx
            .insert(memberRoles)
            .values({ memberId: member.id, roleId: everyone.id });
          const [currUser] = await tx
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);
          if (!currUser) {
            throw new Error("User not found");
          }
          server = {
            ...newServer,
            channels: [channel],
            members: [
              {
                ...member,
                user: currUser,
                roles: [
                  { ...everyone, permissions: everyone.permissions.toString() },
                ],
              },
            ],
          };
          return server;
        })
        .catch((err) => {
          console.error("Error creating server:", err);
          return null;
        });
      return server ?? null;
    } catch (err) {
      console.error("Error creating server:", err);
      return null;
    }
  }

  async leaveServer(serverId: string, userId: string): Promise<boolean> {
    try {
      // The owner cannot leave their own server (must transfer or delete it).
      const [server] = await db
        .select({ ownerId: servers.ownerId })
        .from(servers)
        .where(eq(servers.id, serverId))
        .limit(1);
      if (!server || server.ownerId === userId) {
        return false;
      }
      const member = await db.delete(members).where(
        and(
          eq(members.serverId, serverId), //* Target the server
          eq(members.userId, userId), //* Make sure the user is a member
        ),
      );
      // If no rows were deleted, the user was not a member of the server.
      if (member.rowCount === 0) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  async getServer(
    serverId: Server["id"],
    userId: string,
  ): Promise<ServerWithMembersAndUsersAndChannels | null> {
    try {
      const membersWithUser = await db
        .select()
        .from(members)
        .innerJoin(user, eq(user.id, members.userId))
        .where(eq(members.serverId, serverId));
      if (!membersWithUser.some((row) => row.user.id === userId)) {
        return null;
      }

      const [server] = await db
        .select()
        .from(servers)
        .where(and(eq(servers.id, serverId)));
      if (!server) {
        return null;
      }
      const channelsInServer = await db
        .select()
        .from(channels)
        .where(eq(channels.serverId, serverId));

      // Overlay each member's profile display identity (displayName/avatar) over
      // their auth name/image so the roster reflects the profiles table.
      const summaries = await profileService.getProfileSummaries(
        membersWithUser.map((row) => row.user.id),
      );
      const rolesByMember = await permissionService.getRolesForMembers(
        membersWithUser.map((row) => row.members.id),
      );

      return {
        ...server,
        members: membersWithUser.map((row) => ({
          ...row.members,
          user: applyProfileToUser(row.user, summaries.get(row.user.id)),
          roles: rolesByMember.get(row.members.id) ?? [],
        })),
        channels: channelsInServer,
      };
    } catch (err) {
      return null;
    }
  }

  async getServersByUserId(userId: string) {
    try {
      const userMemberships = await db
        .select({ serverId: members.serverId })
        .from(members)
        .where(eq(members.userId, userId));

      if (userMemberships.length === 0) {
        return [];
      }

      const serverIds = userMemberships.map(
        (membership) => membership.serverId,
      );

      const serversInScope = await db
        .select()
        .from(servers)
        .where(inArray(servers.id, serverIds));

      const membersWithUser = await db
        .select()
        .from(members)
        .innerJoin(user, eq(user.id, members.userId))
        .where(inArray(members.serverId, serverIds));

      const channelsInScope = await db
        .select()
        .from(channels)
        .where(inArray(channels.serverId, serverIds));

      const summaries = await profileService.getProfileSummaries(
        membersWithUser.map((row) => row.user.id),
      );
      const rolesByMember = await permissionService.getRolesForMembers(
        membersWithUser.map((row) => row.members.id),
      );

      return serversInScope.map((server) => ({
        ...server,
        channels: channelsInScope.filter(
          (channel) => channel.serverId === server.id,
        ),
        members: membersWithUser
          .filter((row) => row.members.serverId === server.id)
          .map((row) => ({
            ...row.members,
            user: applyProfileToUser(row.user, summaries.get(row.user.id)),
            roles: rolesByMember.get(row.members.id) ?? [],
          })),
      }));
    } catch (err) {
      return null;
    }
  }

  async updateServerInviteCode(
    serverId: string,
    userId: string,
    inviteCode: string,
  ) {
    try {
      const [server] = await db
        .update(servers)
        .set({ inviteCode })
        .where(eq(servers.id, serverId))
        .returning();
      if (!server) {
        return null;
      }
      return server;
    } catch (err) {
      return null;
    }
  }

  async joinServerFromInviteCode(
    userId: string,
    inviteCode: string,
  ): Promise<boolean> {
    try {
      const success = await db.transaction(async (tx) => {
        //* check if this user have permis
        const server = await tx
          .select({ id: servers.id })
          .from(servers)
          .where(
            and(
              eq(servers.inviteCode, inviteCode),
              notExists(
                tx
                  .select()
                  .from(members)
                  .where(
                    and(
                      eq(members.userId, userId),
                      eq(servers.id, members.serverId),
                    ),
                  ),
              ),
            ),
          )
          .limit(1);
        if (server.length === 0) return false; // user exists or invalid code
        const [newMember] = await tx
          .insert(members)
          .values({
            serverId: server[0].id,
            userId,
          })
          .returning();

        // Every member is in the default @everyone role.
        const [everyone] = await tx
          .select({ id: roles.id })
          .from(roles)
          .where(
            and(
              eq(roles.serverId, server[0].id),
              eq(roles.isDefault, true),
            ),
          )
          .limit(1);
        if (everyone) {
          await tx
            .insert(memberRoles)
            .values({ memberId: newMember.id, roleId: everyone.id });
        }

        return true;
      });
      return success;
    } catch (err) {
      return false;
    }
  }

  // Authorization (MANAGE_SERVER) is enforced by requirePermission at the route.
  async editServer(userId: string, serverId: string, data: Partial<Server>) {
    try {
      const { id, createdAt, ...rest } = data;
      const [server] = await db
        .update(servers)
        .set({
          ...rest,
          ...("image" in data ? { image: toMediaPath(data.image) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(servers.id, serverId))
        .returning();
      return server ?? null;
    } catch (err) {
      return null;
    }
  }
  // Authorization (owner-only) is enforced by requireOwner at the route.
  async deleteServer(serverId: string) {
    try {
      await db.delete(servers).where(eq(servers.id, serverId));
      return true;
    } catch (err) {
      return false;
    }
  }
  async getPublicServers() {
    try {
      const publicServers = await db
        .select()
        .from(servers)
        .where(eq(servers.isPublic, true));
      return publicServers;
    } catch (err) {
      return [];
    }
  }
}

export const serversService = new ServersService();
