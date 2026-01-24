import { db } from "@/db";
import { channels, ChannelType } from "@/db/schema/channel";
import { MemberRole, members } from "@/db/schema/member";
import {
  ServerInput,
  servers,
  ServerWithMembersAndChannels,
  type Server,
} from "@/db/schema/server";
import { and, eq, not, notExists } from "drizzle-orm";

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
          console.error("[ERR_SERVERS_SERVICE:createServer]: ", err);
          return null;
        });

      return server ?? null;
    } catch (err) {
      throw new Error("Internal Server Error: " + err);
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
      throw new Error("[ERR_SERVER_SERVICE:leaveServer]: " + err);
    }
  }

  async getServer(serverId: Server["id"], userId: string) {
    try {
      const rows = await db
        .select()
        .from(servers)
        .leftJoin(members, eq(members.serverId, servers.id))
        .leftJoin(channels, eq(channels.serverId, servers.id))
        .where(and(eq(servers.id, serverId), eq(members.userId, userId)));
      if (rows.length === 0) {
        return null;
      }

      const grouped: Record<string, ServerWithMembersAndChannels> = rows.reduce(
        (acc, row) => {
          const server = row.servers as Server;
          const member = row.members ?? null;
          const channel = row.channels ?? null;

          if (!acc[server.id]) {
            acc[server.id] = {
              ...server,
              members: [],
              channels: [],
            };
          }

          if (member) acc[server.id].members.push(member);
          if (channel) acc[server.id].channels.push(channel);
          return acc;
        },
        {} as Record<string, ServerWithMembersAndChannels>,
      );
      return Object.values(grouped)[0];
    } catch (err) {
      throw new Error("[ERR_SERVER_SERVICE:getServer] " + err);
    }
  }

  async getServersByUserId(userId: string) {
    try {
      const rows = await db
        .select({
          server: servers,
        })
        .from(servers)
        .innerJoin(members, eq(servers.id, members.serverId))
        .where(eq(members.userId, userId));
      return rows.map((row) => row.server);
    } catch (err) {
      throw new Error("[ERR_SERVER_SERVICE:getServerByUserId] " + err);
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
      console.error("[ERR_SERVER_SERVICE:updateServerInviteCode] " + err);
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
      console.error("[ERR_SERVER_SERVICE:joinServerFromInviteCode] ", err);
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
        return { server: null, error: "server not found" };
      }
      return { server, error: null };
    } catch (err) {
      console.error("[ERR_SERVER_SERVICE:editServer] ", err);
      return { server: null, error: "server error" };
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
      console.error("[ERR_SERVER_SERVICE:deleteServer] ", err);
      return false;
    }
  }
}

export const serversService = new ServersService();
