import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { channels, ChannelType } from "@/db/schema/channel";
import { MemberRole, members, MemberWithUser } from "@/db/schema/member";
import {
  ServerInput,
  servers,
  ServerWithMembersAndUsersAndChannels,
  type Server,
} from "@/db/schema/server";
import { and, eq, inArray, not, notExists } from "drizzle-orm";

class ServersService {
  async createServer(
    userId: string,
    serverData: ServerInput,
  ): Promise<Server | null> {
    try {
      const server: Server | null = await db
        .transaction(async (tx) => {
          const [newServer] = await tx
            .insert(servers)
            .values(serverData)
            .returning();
          await tx.insert(channels).values({
            name: "#general",
            serverId: newServer.id,
            type: ChannelType.TEXT,
          });
          await tx.insert(members).values({
            userId,
            role: MemberRole.ADMIN,
            serverId: newServer.id,
          });
          return newServer;
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
      const member = await db.delete(members).where(
        and(
          eq(members.serverId, serverId), //* Target the server
          eq(members.userId, userId), //* Make sure the user is a member
          not(eq(members.role, MemberRole.ADMIN)), //* Prevent admin from leaving
        ),
      );
      // If no rows were deleted, the user was not a member or was the admin
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

      return {
        ...server,
        members: membersWithUser.map((row) => ({
          ...row.members,
          user: row.user,
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

      return serversInScope.map((server) => ({
        ...server,
        channels: channelsInScope.filter(
          (channel) => channel.serverId === server.id,
        ),
        members: membersWithUser
          .filter((row) => row.members.serverId === server.id)
          .map((row) => ({
            ...row.members,
            user: row.user,
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
      await db
        .update(servers)
        .set({ inviteCode })
        .where(eq(servers.id, serverId));
      return true;
    } catch (err) {
      return false;
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
                      eq(members.id, userId),
                      eq(servers.id, members.serverId),
                    ),
                  ),
              ),
            ),
          )
          .limit(1);
        if (server.length === 0) return false; // user exists or invalid code
        await tx.insert(members).values({
          serverId: server[0].id,
          userId,
        });

        return true;
      });
      return success;
    } catch (err) {
      return false;
    }
  }

  async editServer(serverId: string, data: Partial<Server>) {
    try {
      const server = await db
        .update(servers)
        .set(data)
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
  async deleteServer(serverId: string, userId: string) {
    try {
      //* check if userId is Member and Admin of server serverId
      const member = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.serverId, serverId),
            eq(members.userId, userId),
            eq(members.role, MemberRole.ADMIN),
          ),
        );
      if (member.length === 0) {
        return false; //* not found or not authorized
      }
      await db.delete(servers).where(eq(servers.id, serverId));
      return true;
    } catch (err) {
      return false;
    }
  }
}

export const serversService = new ServersService();
