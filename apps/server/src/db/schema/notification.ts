import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";

/**
 * A notification delivered to a single recipient (`userId`).
 *
 * This is the persistence layer / "inbox" for notifications: mentions,
 * DMs and friend events. Realtime delivery rides the socket layer; this table is
 * the source of truth for history and unread counts, so a user who was offline
 * still sees what they missed on next load.
 *
 * Navigation context (`channelId` / `serverId` / `messageId`) is stored as plain
 * columns rather than foreign keys: they're soft pointers used to route a click,
 * and we don't want a deleted channel to evaporate the user's notification
 * history. The `actorId` FK is set-null so a deleted actor leaves the
 * notification intact (rendered without an avatar).
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    // The recipient.
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    read: boolean("read").default(false).notNull(),
    // Who triggered it (null for system notifications).
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // Soft navigation pointers (no FK — see file header).
    channelId: uuid("channel_id"),
    serverId: uuid("server_id"),
    messageId: uuid("message_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // The hot path: "my notifications, newest first".
    index("notifications_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    // Counting / filtering unread for a user.
    index("notifications_user_id_read_idx").on(table.userId, table.read),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NotificationInput = typeof notifications.$inferInsert;
