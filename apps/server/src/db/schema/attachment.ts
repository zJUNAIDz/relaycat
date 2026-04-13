import {v7 as uuidv7 } from "uuid";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { messages } from "./message";

export const attachments = pgTable("attachments", {
  id: uuid("id").$defaultFn(() => uuidv7()).primaryKey(),
  messageId: uuid("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  contentType: text("content_type"),
  size: text("size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
