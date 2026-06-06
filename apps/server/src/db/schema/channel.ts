import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import { servers } from "./server";
// TEXT/VOICE are server channels; DM is a 1-1 direct-message channel that has
// no server (serverId is null) and tracks its members via `dm_participants`.
const channelTypes = ["TEXT", "VOICE", "DM"] as const;
export const channelTypeEnum = pgEnum("channel_type", channelTypes);
export const channels = pgTable(
  "channels",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    name: text("name").notNull(),
    type: channelTypeEnum("type").notNull().default("TEXT"),
    // Nullable: DM channels are not owned by any server.
    serverId: uuid("server_id").references(() => servers.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("channels_server_id_idx").on(table.serverId)],
);

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
export const ChannelInsertSchema = createInsertSchema(channels);
