import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { servers } from "./server";
const channelTypes = ["TEXT", "VOICE"] as const;
export const channelTypeEnum = pgEnum("channel_type", channelTypes);
export const channels = pgTable("channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: channelTypeEnum("type").notNull().default("TEXT"),
  serverId: uuid("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const ChannelType = channelTypes.reduce(
  (acc, type) => {
    acc[type] = type;
    return acc;
  },
  {} as Record<(typeof channelTypes)[number], (typeof channelTypes)[number]>,
);
export type Channel = typeof channels.$inferSelect;
export type ChannelInput = typeof channels.$inferInsert;
export const ChannelSelectSchema = createSelectSchema(channels);
export const ChannelInsertSchema = createSelectSchema(channels);
