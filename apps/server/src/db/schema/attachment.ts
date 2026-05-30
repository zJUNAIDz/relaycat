import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { messages } from "./message";

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    messageId: uuid("message_id")
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),
    filename: text("filename").notNull(),
    url: text("url").notNull(),
    contentType: text("content_type"),
    size: text("size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("attachments_message_id_idx").on(table.messageId)],
);
