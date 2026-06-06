import { index, pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { channels } from "./channel";
import { user } from "./auth-schema";

/**
 * Membership of a DM channel. A DM channel (channels.type === "DM") has exactly
 * two participant rows for a 1-1 conversation. Modelled as a join table rather
 * than two columns so the same shape can later support group DMs.
 */
export const dmParticipants = pgTable(
  "dm_participants",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    channelId: uuid("channel_id")
      .references(() => channels.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // A user appears at most once per DM channel.
    unique("dm_participants_channel_user_uq").on(table.channelId, table.userId),
    index("dm_participants_channel_id_idx").on(table.channelId),
    index("dm_participants_user_id_idx").on(table.userId),
  ],
);

export const dmParticipantRelations = relations(dmParticipants, ({ one }) => ({
  channel: one(channels, {
    fields: [dmParticipants.channelId],
    references: [channels.id],
  }),
  user: one(user, {
    fields: [dmParticipants.userId],
    references: [user.id],
  }),
}));

export type DmParticipant = typeof dmParticipants.$inferSelect;
export type DmParticipantInput = typeof dmParticipants.$inferInsert;
