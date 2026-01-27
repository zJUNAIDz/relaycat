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
    try {
      const channel = await db.transaction(async (tx) => {
        const [channel] = await tx
          .select()
          .from(channels)
          .where(eq(channels.id, channelId))
          .limit(1);
        const [server] = await tx
          .select()
          .from(servers)
          .where(eq(servers.id, channel.serverId));
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
        return channel;
      });
      return channel;
    } catch (err) {
      console.error("[getChannelById]", err);
      return null;
    }
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

  async editChannel(
    newData: ChannelInput,
    channelId: Channel["id"],
    userId: string,
  ): Promise<Channel | null> {
    try {
      const updatedChannel = await db.transaction(async (tx) => {
        const [channel] = await tx
          .select()
          .from(channels)
          .where(eq(channels.id, channelId))
          .limit(1);
        if (!channel) {
          return null;
        }
        const [server] = await tx
          .select()
          .from(servers)
          .where(eq(servers.id, channel.serverId));
        const [member] = await tx
          .select()
          .from(members)
          .where(
            and(eq(members.serverId, server.id), eq(members.userId, userId)),
          )
          .limit(1);
        if (
          !member ||
          (member.role !== "ADMIN" && member.role !== "MODERATOR")
        ) {
          return null;
        }
        const [updatedChannel] = await tx
          .update(channels)
          .set(newData)
          .where(eq(channels.id, channelId))
          .returning();
        return updatedChannel;
      });
      return updatedChannel;
    } catch (err) {
      console.error("[channelEdit] ", err);
      return null;
    }
  }

  async deleteChannel(channelId: Channel["id"], userId: string) {
    try {
      const deletedChannel = await db.transaction(async (tx) => {
        const [channel] = await tx
          .select()
          .from(channels)
          .where(eq(channels.id, channelId))
          .limit(1);
        if (!channel) {
          return null;
        }
        const [server] = await tx
          .select()
          .from(servers)
          .where(eq(servers.id, channel.serverId));
        const [member] = await tx
          .select()
          .from(members)
          .where(
            and(eq(members.serverId, server.id), eq(members.userId, userId)),
          )
          .limit(1);
        if (
          !member ||
          (member.role !== "ADMIN" && member.role !== "MODERATOR")
        ) {
          return null;
        }
        const [deletedChannel] = await tx
          .delete(channels)
          .where(eq(channels.id, channelId))
          .returning();
        return deletedChannel;
      });
      return deletedChannel;
    } catch (err) {
      console.error("[channelDelete] ", err);
      return null;
    }
  }
}

export const channelService = ChannelService.getInstance();
