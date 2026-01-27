import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { channels } from "./channel";
import { Member, members } from "./member";

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content"),
  mentions: text("mentions").array().default([]),
  mentionRoles: text("mention_roles").array().default([]),
  reactions: text("reactions").array().default([]),
  deleted: boolean("deleted").default(false).notNull(),
  memberId: uuid("member_id")
    .references(() => members.id, { onDelete: "cascade" })
    .notNull(),
  channelId: uuid("channel_id")
    .references(() => channels.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export type Message = typeof messages.$inferSelect;
export type MessageInput = typeof messages.$inferInsert;
export type MessageAndMember = { message: Message; member: Member };
export const MessageInsertSchema = createInsertSchema(messages);
export const MessageSelectSchema = createSelectSchema(messages);
export const MessageCreateSchema = MessageInsertSchema.omit({
  channelId: true,
  memberId: true,
  updatedAt: true,
  createdAt: true,
});
