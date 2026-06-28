import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { channels } from "@/db/schema/channel";
import { dmParticipants } from "@/db/schema/dm";
import { members } from "@/db/schema/member";
import { messages } from "@/db/schema/message";
import { profiles } from "@/db/schema/profile";
import { logger } from "@/lib/logger";
import { friendsService } from "@/modules/friends/service";
import { aliasedTable, and, desc, eq, gt, inArray, lt, ne } from "drizzle-orm";
import type { DmChannel, FriendUser } from "@repo/types";
import { DmCursor, Result } from "./types";

const MESSAGE_BATCH = 20;

/**
 * A DM message projected into the same `{ message, member, user }` shape the
 * server chat UI consumes. DMs have no server member, so `member` is a thin
 * synthesised stand-in whose `id` is the author's userId — enough for the
 * client's ownership checks (currentMember.id === member.id).
 */
function synthMember(authorId: string, createdAt: Date) {
  return {
    id: authorId,
    userId: authorId,
    role: "MEMBER" as const,
    serverId: null,
    createdAt,
    updatedAt: null,
  };
}

class DmService {
  /** Gate: two users may DM if they are friends OR share a server. */
  private async canDm(a: string, b: string): Promise<boolean> {
    if (await friendsService.areFriends(a, b)) return true;
    const ma = aliasedTable(members, "ma");
    const mb = aliasedTable(members, "mb");
    const [shared] = await db
      .select({ serverId: ma.serverId })
      .from(ma)
      .innerJoin(mb, eq(ma.serverId, mb.serverId))
      .where(and(eq(ma.userId, a), eq(mb.userId, b)))
      .limit(1);
    return !!shared;
  }

  /** Find the existing 1-1 DM channel shared by exactly these two users. */
  private async findDmChannelId(
    a: string,
    b: string,
    tx = db,
  ): Promise<string | null> {
    const pa = aliasedTable(dmParticipants, "pa");
    const pb = aliasedTable(dmParticipants, "pb");
    const [row] = await tx
      .select({ channelId: pa.channelId })
      .from(pa)
      .innerJoin(pb, eq(pa.channelId, pb.channelId))
      .innerJoin(channels, eq(channels.id, pa.channelId))
      .where(
        and(eq(pa.userId, a), eq(pb.userId, b), eq(channels.type, "DM")),
      )
      .limit(1);
    return row?.channelId ?? null;
  }

  /** Project the "other" participant of a DM channel into a FriendUser. */
  private async otherUser(
    channelId: string,
    currentUserId: string,
    tx = db,
  ): Promise<FriendUser | null> {
    const [row] = await tx
      .select({
        userId: user.id,
        name: user.name,
        username: profiles.username,
        displayName: profiles.displayName,
        avatar: profiles.avatar,
      })
      .from(dmParticipants)
      .innerJoin(user, eq(user.id, dmParticipants.userId))
      .leftJoin(profiles, eq(profiles.userId, user.id))
      .where(
        and(
          eq(dmParticipants.channelId, channelId),
          ne(dmParticipants.userId, currentUserId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /** True when the user is a participant of the DM channel. */
  private async isParticipant(
    channelId: string,
    userId: string,
    tx = db,
  ): Promise<boolean> {
    const [row] = await tx
      .select({ id: dmParticipants.id })
      .from(dmParticipants)
      .where(
        and(
          eq(dmParticipants.channelId, channelId),
          eq(dmParticipants.userId, userId),
        ),
      )
      .limit(1);
    return !!row;
  }

  /** The other participant(s) of a DM channel — the recipients to notify. */
  async recipientIds(channelId: string, senderId: string): Promise<string[]> {
    const rows = await db
      .select({ userId: dmParticipants.userId })
      .from(dmParticipants)
      .where(
        and(
          eq(dmParticipants.channelId, channelId),
          ne(dmParticipants.userId, senderId),
        ),
      );
    return rows.map((r) => r.userId);
  }

  /** Get-or-create the 1-1 DM channel between the current user and `otherUserId`. */
  async getOrCreate(
    currentUserId: string,
    otherUserId: string,
  ): Promise<Result<DmChannel>> {
    try {
      if (currentUserId === otherUserId)
        return { ok: false, error: "You cannot DM yourself" };
      if (!(await this.canDm(currentUserId, otherUserId)))
        return {
          ok: false,
          error: "You can only DM friends or people you share a server with",
        };

      const channelId = await db.transaction(async (tx) => {
        const existing = await this.findDmChannelId(
          currentUserId,
          otherUserId,
          tx,
        );
        if (existing) return existing;

        const [channel] = await tx
          .insert(channels)
          .values({ name: "direct-message", type: "DM", serverId: null })
          .returning({ id: channels.id });
        await tx.insert(dmParticipants).values([
          { channelId: channel.id, userId: currentUserId },
          { channelId: channel.id, userId: otherUserId },
        ]);
        return channel.id;
      });

      return this.getChannel(currentUserId, channelId);
    } catch (error) {
      logger.error({ error, otherUserId }, "[dmService/getOrCreate]");
      return { ok: false, error: "Could not open DM" };
    }
  }

  /** A single DM channel projected for the current user. */
  async getChannel(
    currentUserId: string,
    channelId: string,
  ): Promise<Result<DmChannel>> {
    try {
      if (!(await this.isParticipant(channelId, currentUserId)))
        return { ok: false, error: "DM not found" };
      const [channel] = await db
        .select({
          id: channels.id,
          createdAt: channels.createdAt,
          updatedAt: channels.updatedAt,
        })
        .from(channels)
        .where(eq(channels.id, channelId))
        .limit(1);
      if (!channel) return { ok: false, error: "DM not found" };
      const otherUser = await this.otherUser(channelId, currentUserId);
      if (!otherUser) return { ok: false, error: "DM has no other participant" };
      return { ok: true, data: { ...channel, otherUser } };
    } catch (error) {
      logger.error({ error, channelId }, "[dmService/getChannel]");
      return { ok: false, error: "Could not load DM" };
    }
  }

  /** All DM channels the current user participates in. */
  async listChannels(currentUserId: string): Promise<Result<DmChannel[]>> {
    try {
      const mine = await db
        .select({ channelId: dmParticipants.channelId })
        .from(dmParticipants)
        .where(eq(dmParticipants.userId, currentUserId));
      const ids = mine.map((m) => m.channelId);
      if (ids.length === 0) return { ok: true, data: [] };

      const channelRows = await db
        .select({
          id: channels.id,
          createdAt: channels.createdAt,
          updatedAt: channels.updatedAt,
        })
        .from(channels)
        .where(and(inArray(channels.id, ids), eq(channels.type, "DM")));

      const data: DmChannel[] = [];
      for (const ch of channelRows) {
        const otherUser = await this.otherUser(ch.id, currentUserId);
        if (otherUser) data.push({ ...ch, otherUser });
      }
      return { ok: true, data };
    } catch (error) {
      logger.error({ error }, "[dmService/listChannels]");
      return { ok: false, error: "Could not load DMs" };
    }
  }

  /** Paginated DM messages, newest-first, in the chat UI's shape. */
  async getMessages(
    currentUserId: string,
    channelId: string,
    cursor?: DmCursor,
  ) {
    try {
      if (!(await this.isParticipant(channelId, currentUserId)))
        return { ok: false as const, error: "DM not found" };

      const cursorCondition =
        cursor?.type === "after"
          ? gt(messages.id, cursor.after)
          : cursor?.type === "before"
            ? lt(messages.id, cursor.before)
            : undefined;
      const limit = cursor ? Math.min(cursor.limit, MESSAGE_BATCH) : MESSAGE_BATCH;

      const rows = await db
        .select({ message: messages, author: user })
        .from(messages)
        .innerJoin(user, eq(user.id, messages.authorId))
        .where(and(eq(messages.channelId, channelId), cursorCondition))
        .orderBy(desc(messages.id))
        .limit(limit);

      const result = rows.map((r) => ({
        message: r.message,
        member: synthMember(r.message.authorId, r.message.createdAt),
        user: r.author,
      }));
      const nextCursor =
        result.length === limit ? result[result.length - 1].message.id : null;

      return { ok: true as const, data: { result, nextCursor } };
    } catch (error) {
      logger.error({ error, channelId }, "[dmService/getMessages]");
      return { ok: false as const, error: "Could not load messages" };
    }
  }

  /** Send a DM message, returning it in the chat UI's shape. */
  async sendMessage(
    currentUserId: string,
    channelId: string,
    input: { content?: string | null; fileUrl?: string | null },
  ) {
    try {
      if (!(await this.isParticipant(channelId, currentUserId)))
        return { ok: false as const, error: "DM not found" };
      const [message] = await db
        .insert(messages)
        .values({ ...input, channelId, authorId: currentUserId })
        .returning();
      const [author] = await db
        .select()
        .from(user)
        .where(eq(user.id, currentUserId))
        .limit(1);
      return {
        ok: true as const,
        data: {
          message,
          member: synthMember(currentUserId, message.createdAt),
          user: author,
        },
      };
    } catch (error) {
      logger.error({ error, channelId }, "[dmService/sendMessage]");
      return { ok: false as const, error: "Could not send message" };
    }
  }

  /** Edit a DM message the current user authored. */
  async editMessage(
    currentUserId: string,
    messageId: string,
    content: string,
  ) {
    try {
      const [updated] = await db
        .update(messages)
        .set({ content, updatedAt: new Date() })
        .where(
          and(
            eq(messages.id, messageId),
            eq(messages.authorId, currentUserId),
          ),
        )
        .returning();
      if (!updated)
        return { ok: false as const, error: "Message not found or not yours" };
      return { ok: true as const, data: updated };
    } catch (error) {
      logger.error({ error, messageId }, "[dmService/editMessage]");
      return { ok: false as const, error: "Could not edit message" };
    }
  }

  /** Soft-delete a DM message the current user authored. */
  async deleteMessage(currentUserId: string, messageId: string) {
    try {
      const [deleted] = await db
        .update(messages)
        .set({ deleted: true, content: null, updatedAt: new Date() })
        .where(
          and(
            eq(messages.id, messageId),
            eq(messages.authorId, currentUserId),
          ),
        )
        .returning();
      if (!deleted)
        return { ok: false as const, error: "Message not found or not yours" };
      return { ok: true as const, data: deleted };
    } catch (error) {
      logger.error({ error, messageId }, "[dmService/deleteMessage]");
      return { ok: false as const, error: "Could not delete message" };
    }
  }
}

export const dmService = new DmService();
