import { db } from "@/db";
import { Channel, channels } from "@/db/schema/channel";
import { Member, members } from "@/db/schema/member";
import {
  Message,
  MessageAndMember,
  MessageCreateSchema,
  messages,
  MessageWithMemberWithUser,
} from "@/db/schema/message";
import { and, desc, eq, gt, lt } from "drizzle-orm";
import z from "zod/v4";
import { cursorSchema, Result } from "./types";
import { user } from "@/db/schema/auth-schema";
import { applyProfileToUser, profileService } from "@/services/profile.service";
import {
  permissionService,
  type MemberContext,
} from "@/services/permission.service";
import { Permission } from "@repo/types";
import { User } from "better-auth/types";

class MessageService {
  private MESSAGE_BATCH = 10;
  /**
   * Membership and SEND_MESSAGES are enforced by requirePermission at the route;
   * `ctx` is the already-resolved member context for this channel's server, so
   * the author is taken from it rather than re-derived here.
   */
  async createMessage(
    messageInput: z.infer<typeof MessageCreateSchema>,
    channelId: Channel["id"],
    ctx: MemberContext,
  ): Promise<Result<{ message: Message; member: Member; user: User }>> {
    try {
      const newMessage = await db.transaction(async (tx) => {
        const [channel] = await tx
          .select()
          .from(channels)
          .where(eq(channels.id, channelId))
          .limit(1);
        if (!channel) {
          throw new Error("Channel not found");
        }
        // The context is resolved from this channel's server by the middleware;
        // this guards against a channel/server mismatch slipping through.
        if (channel.serverId !== ctx.serverId) {
          throw new Error("Channel does not belong to this server");
        }
        const [currentMember] = await tx
          .select()
          .from(members)
          .where(eq(members.id, ctx.memberId))
          .limit(1);
        if (!currentMember) {
          throw new Error("Member not found in server");
        }

        const [message] = await tx
          .insert(messages)
          .values({
            ...messageInput,
            channelId,
            memberId: currentMember.id,
            authorId: currentMember.userId,
          })
          .returning();
        const [currentUser] = await tx
          .select()
          .from(user)
          .where(eq(user.id, currentMember.userId))
          .limit(1);
        return { message, member: currentMember, user: currentUser };
      });
      if (!newMessage) {
        return { ok: false, error: "Message not created" };
      }

      // Render the author by their profile identity (displayName/avatar).
      const summaries = await profileService.getProfileSummaries([
        newMessage.user.id,
      ]);
      return {
        ok: true,
        data: {
          ...newMessage,
          user: applyProfileToUser(
            newMessage.user,
            summaries.get(newMessage.user.id),
          ),
        },
      };
    } catch (error) {
      console.error("[createMessage] ", error);
      return { ok: false, error };
    }
  }
  /**
   * Membership (VIEW_SERVER) is enforced by requirePermission at the route, which
   * resolves the server from this channel — a non-member never reaches here.
   */
  async getMessagesByChannelId(
    channelId: Channel["id"],
    cursor?: z.infer<typeof cursorSchema>,
  ): Promise<
    Result<{ result: MessageWithMemberWithUser[]; nextCursor: string | null }>
  > {
    try {
      const { messagesList, nextCursor } = await db.transaction(async (tx) => {
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
        console.log({ cursor, messageCount });
        const messagesList = await tx
          .select({
            message: messages,
            member: members,
            user: user,
          })
          .from(messages)
          .where(and(eq(messages.channelId, channelId), cursorCondition))
          .leftJoin(members, eq(messages.memberId, members.id))
          .leftJoin(user, eq(members.userId, user.id))
          .orderBy(desc(messages.id))
          .limit(messageCount);
        // Filter out any rows where member is null so the result conforms to MessageAndMember[]
        const filteredMessagesList = messagesList.filter(
          (m): m is MessageWithMemberWithUser => m.member !== null,
        );

        let nextCursor = null;
        if (filteredMessagesList.length === messageCount) {
          nextCursor =
            filteredMessagesList[filteredMessagesList.length - 1].message.id;
        }

        return { messagesList: filteredMessagesList, nextCursor };
      });

      // Overlay each author's profile identity onto the auth user.
      const summaries = await profileService.getProfileSummaries(
        messagesList.map((m) => m.user?.id).filter((id): id is string => !!id),
      );
      const result = messagesList.map((m) => ({
        ...m,
        user: applyProfileToUser(m.user, summaries.get(m.user.id)),
      }));

      return { ok: true, data: { result, nextCursor } };
    } catch (error) {
      // console.error("[getMessagesByChannelId] ", error);
      return { ok: false, error };
    }
  }
  /**
   * Editing a message is author-only, by design: MANAGE_MESSAGES lets a moderator
   * remove someone else's message, never rewrite it under their name.
   */
  async updateMessage(
    messageId: Message["id"],
    channelId: Channel["id"],
    ctx: MemberContext,
    updatedMessageInput: z.infer<typeof MessageCreateSchema>,
  ): Promise<Result<Message>> {
    try {
      const updatedMessage = await db.transaction(async (tx) => {
        // Scope by channel too: the channel in the path is what was authorized,
        // so a message id from another channel must not be reachable here.
        const [message] = await tx
          .select()
          .from(messages)
          .where(
            and(eq(messages.id, messageId), eq(messages.channelId, channelId)),
          )
          .limit(1);
        if (!message) {
          throw new Error("Message not found");
        }
        if (message.memberId !== ctx.memberId) {
          throw new Error("Unauthorized to update this message");
        }
        const [updated] = await tx
          .update(messages)
          .set({ ...updatedMessageInput, updatedAt: new Date() })
          .where(eq(messages.id, messageId))
          .returning();
        return updated;
      });
      return { ok: true, data: updatedMessage };
    } catch (error) {
      console.error("[updateMessage] ", error);
      return { ok: false, error };
    }
  }

  /**
   * Soft-delete a message. Allowed for the message's author, or for any member
   * holding MANAGE_MESSAGES in the channel's server (owners/ADMINISTRATOR
   * included, via permissionService.can).
   */
  async softDeleteMessage(
    id: Message["id"],
    channelId: Channel["id"],
    ctx: MemberContext,
  ): Promise<Result<Message>> {
    try {
      const result = await db.transaction(async (tx) => {
        const [message] = await tx
          .select()
          .from(messages)
          .where(and(eq(messages.id, id), eq(messages.channelId, channelId)))
          .limit(1);
        if (!message) {
          return null;
        }

        const isAuthor = message.memberId === ctx.memberId;
        if (!isAuthor && !permissionService.can(ctx, Permission.MANAGE_MESSAGES)) {
          return null;
        }

        const [deleted] = await tx
          .update(messages)
          .set({ deleted: true, updatedAt: new Date() })
          .where(eq(messages.id, id))
          .returning();
        return deleted ?? null;
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
