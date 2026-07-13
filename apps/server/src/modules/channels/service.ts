import { db } from "@/db";
import { Channel, ChannelInput, channels } from "@/db/schema/channel";
import { members } from "@/db/schema/member";
import { Server, servers } from "@/db/schema/server";
import { and, asc, eq } from "drizzle-orm";

class ChannelService {
  private static instance: ChannelService;
  static getInstance() {
    if (!ChannelService.instance) {
      ChannelService.instance = new ChannelService();
    }
    return ChannelService.instance;
  }

  async createChannel(
    channel: ChannelInput,
    userId: string,
  ): Promise<Channel | null> {
    try {
      const newChannel = await db.transaction(async (tx) => {
        const [server] = await tx
          .select()
          .from(servers)
          .where(eq(servers.id, channel.serverId))
          .limit(1);
        if (!server) {
          return null;
        }
        const [member] = await tx
          .select()
          .from(members)
          .where(
            and(eq(members.serverId, server.id), eq(members.userId, userId)),
          )
          .limit(1);
        if (!member) {
          return null;
        }
        const [newChannel] = await tx
          .insert(channels)
          .values(channel)
          .returning();
        if (!newChannel) {
          return null;
        }
        return newChannel;
      });
      return newChannel;
    } catch (err) {
      return null;
    }
  }

  async getChannelById(channelId: Channel["id"], userId: string) {
    const [result] = await db
      .select({
        channel: channels,
      })
      .from(channels)
      .innerJoin(
        members,
        and(
          eq(members.serverId, channels.serverId),
          eq(members.userId, userId),
        ),
      )
      .where(eq(channels.id, channelId))
      .limit(1);
    return result?.channel ?? null;
  }

  async getChannelsByServerId(
    serverId: Server["id"],
    userId: string,
  ): Promise<Channel[] | null> {
    try {
      const channelsList = await db.transaction(async (tx) => {
        // check if user is member of the server
        const [member] = await tx
          .select()
          .from(members)
          .where(
            and(eq(members.serverId, serverId), eq(members.userId, userId)),
          )
          .limit(1);
        if (!member) {
          return [];
        }
        const list = await tx
          .select()
          .from(channels)
          .where(and(eq(channels.serverId, serverId)))
          .orderBy(asc(channels.createdAt));
        if (!list) {
          return [];
        }
        return list;
      });
      return channelsList;
    } catch (err) {
      console.error("[getChannelsByServerId] ", err);
      return null;
    }
  }

  /** The server a channel belongs to — used to scope permission checks. */
  async getServerIdForChannel(
    channelId: Channel["id"] | undefined,
  ): Promise<string | undefined | null> {
    if (!channelId) return undefined;
    const [channel] = await db
      .select({ serverId: channels.serverId })
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);
    return channel?.serverId;
  }

  // Authorization (MANAGE_CHANNELS) is enforced by requirePermission at the route.
  async editChannel(
    newData: { name: string },
    channelId: Channel["id"],
  ): Promise<Channel | null> {
    try {
      const [updatedChannel] = await db
        .update(channels)
        .set(newData)
        .where(eq(channels.id, channelId))
        .returning();
      return updatedChannel ?? null;
    } catch (err) {
      console.error("[channelEdit] ", err);
      return null;
    }
  }

  // Authorization (MANAGE_CHANNELS) is enforced by requirePermission at the route.
  async deleteChannel(channelId: Channel["id"]) {
    try {
      const [deletedChannel] = await db
        .delete(channels)
        .where(eq(channels.id, channelId))
        .returning();
      return deletedChannel ?? null;
    } catch (err) {
      console.error("[channelDelete] ", err);
      return null;
    }
  }
}

export const channelService = ChannelService.getInstance();
