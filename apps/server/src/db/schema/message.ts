import { User } from "better-auth";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import { channels } from "./channel";
import { Member, members } from "./member";
import { user } from "./auth-schema";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    content: text("content"),
    mentions: text("mentions").array().default([]),
    mentionRoles: text("mention_roles").array().default([]),
    reactions: text("reactions").array().default([]),
    deleted: boolean("deleted").default(false).notNull(),
    // The real author. Always set, for both server and DM messages — this is the
    // single source of truth for "who sent this".
    authorId: text("author_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    // Server context only: which server-member row authored it. Null for DMs.
    memberId: uuid("member_id").references(() => members.id, {
      onDelete: "cascade",
    }),
    channelId: uuid("channel_id")
      .references(() => channels.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("messages_author_id_idx").on(table.authorId),
    index("messages_member_id_idx").on(table.memberId),
    index("messages_channel_id_idx").on(table.channelId),
  ],
);

export type Message = typeof messages.$inferSelect;
export type MessageInput = typeof messages.$inferInsert;
export type MessageAndMember = { message: Message; member: Member };
export type MessageWithMemberWithUser = {
  message: Message;
  member: Member;
  user: User & { image: string | null };
};
export const MessageInsertSchema = createInsertSchema(messages);
export const MessageSelectSchema = createSelectSchema(messages);
export const MessageCreateSchema = MessageInsertSchema.omit({
  channelId: true,
  memberId: true,
  authorId: true,
  updatedAt: true,
  createdAt: true,
});
