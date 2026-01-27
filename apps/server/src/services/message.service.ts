import { db } from "@/db";
import { Channel, channels } from "@/db/schema/channel";
import { Member, members } from "@/db/schema/member";
import {
  Message,
  MessageAndMember,
  MessageCreateSchema,
  messages,
} from "@/db/schema/message";
import { servers } from "@/db/schema/server";
import { cursorSchema, Result } from "@/types";
import { and, desc, eq, gt, lt } from "drizzle-orm";
import z from "zod/v4";

class MessageService {
  private MESSAGE_BATCH = 10;
  async createMessage(
    messageInput: z.infer<typeof MessageCreateSchema>,
    channelId: Channel["id"],
    currentUserId: Member["id"],
  ): Promise<Result<Message>> {
    try {
      const newMessage = await db.transaction(async (tx) => {
        console.log(channelId, currentUserId);
        const [channel] = await tx
          .select()
          .from(channels)
          .where(eq(channels.id, channelId))
          .limit(1);
        if (!channel) {
          throw new Error("Channel not found");
        }
        const [currentMember] = await tx
          .select()
          .from(members)
          .where(
            and(
              eq(members.userId, currentUserId),
              eq(members.serverId, channel.serverId),
            ),
          )
          .limit(1);
        if (!currentMember) {
          throw new Error("Member not found in server");
        }

        const [message] = await tx
          .insert(messages)
          .values({
            ...messageInput,
            channelId,
            memberId: currentUserId,
          })
          .returning();

        return message;
      });
      if (!newMessage) {
        return { ok: false, error: "Message not created" };
      }

      return { ok: true, data: newMessage };
    } catch (error) {
      console.error("[createMessage] ", error);
      return { ok: false, error };
    }
  }
  async getMessagesByChannelId(
    channelId: Channel["id"],
    currentUserId: string,
    cursor?: z.infer<typeof cursorSchema>,
  ): Promise<
    Result<{ result: MessageAndMember[]; nextCursor: string | null }>
  > {
    try {
      const { messagesList, nextCursor } = await db.transaction(async (tx) => {
        // Transactional operations can be performed here if needed
        const [channel] = await tx
          .select()
          .from(channels)
          .where(eq(channels.id, channelId))
          .limit(1);
        const [server] = await tx
          .select()
          .from(servers)
          .where(eq(servers.id, channel.serverId))
          .limit(1);
        const currentMember = await tx
          .select()
          .from(members)
          .where(
            and(
              eq(members.userId, currentUserId),
              eq(members.serverId, server.id),
            ),
          )
          .limit(1);
        if (!currentMember) {
          throw new Error("Member not found in server");
        }

        const cursorCondition =
          cursor?.type === "after"
            ? gt(messages.id, cursor.after)
            : cursor?.type === "before"
              ? lt(messages.id, cursor.before)
              : undefined;
        const messageCount =
          cursor && cursor?.limit < this.MESSAGE_BATCH
            ? cursor?.limit
            : this.MESSAGE_BATCH;

        const messagesList = await tx
          .select({
            message: messages,
            member: members,
          })
          .from(messages)
          .where(and(eq(messages.channelId, channelId), cursorCondition))
          .leftJoin(members, eq(messages.memberId, members.id))
          .orderBy(desc(messages.id))
          .limit(messageCount);
        // Filter out any rows where member is null so the result conforms to MessageAndMember[]
        const filteredMessagesList = messagesList.filter(
          (m): m is MessageAndMember => m.member !== null,
        );

        let nextCursor = null;
        if (filteredMessagesList.length === messageCount) {
          nextCursor =
            filteredMessagesList[filteredMessagesList.length - 1].message.id;
        }

        return { messagesList: filteredMessagesList, nextCursor };
      });

      return { ok: true, data: { result: messagesList, nextCursor } };
    } catch (error) {
      // console.error("[getMessagesByChannelId] ", error);
      return { ok: false, error };
    }
  }
  async updateMessage(
    messageId: Message["id"],
    currentUserId: string,
    updatedMessageInput: z.infer<typeof MessageCreateSchema>,
  ): Promise<Result<Message[]>> {
    try {
      const updatedMessage = await db.transaction(async (tx) => {
        const [message] = await tx
          .select()
          .from(messages)
          .where(eq(messages.id, messageId))
          .limit(1);
        if (!message) {
          throw new Error("Message not found");
        }
        const [member] = await tx
          .select()
          .from(members)
          .where(
            and(
              eq(members.id, message.memberId),
              eq(members.userId, currentUserId),
            ),
          )
          .limit(1);
        if (!member) {
          throw new Error("Unauthorized to update this message");
        }
        const updatedMessage = await tx
          .update(messages)
          .set(updatedMessageInput)
          .where(eq(messages.id, messageId))
          .returning();
        return updatedMessage;
      });
      return { ok: true, data: updatedMessage };
    } catch (error) {
      console.error("[updateMessage] ", error);
      return { ok: false, error };
    }
  }
  async softDeleteMessage(
    id: Message["id"],
    currentUserId: string,
  ): Promise<Result<Message>> {
    try {
      const result = await db.transaction(async (tx) => {
        const [currentMember] = await tx
          .select()
          .from(members)
          .where(eq(members.userId, currentUserId))
          .limit(1);
        if (!currentMember) {
          return null;
        }

        const [message] = await tx
          .select()
          .from(messages)
          .where(
            and(eq(messages.id, id), eq(messages.memberId, currentMember.id)),
          )
          .limit(1);
        if (!message) {
          return null;
        }

        const result = await tx
          .update(messages)
          .set({ deleted: true })
          .where(
            and(eq(messages.id, id), eq(messages.memberId, currentMember.id)),
          );
        if (result.rowCount === 0) {
          return null;
        }

        return message;
      });
      if (!result) {
        return { ok: false, error: "Message not found or unauthorized" };
      }
      return { ok: true, data: result };
    } catch (error) {
      console.error("[deleteMessage] ", error);
      return { ok: false, error };
    }
  }
}
export const messageService = new MessageService();
