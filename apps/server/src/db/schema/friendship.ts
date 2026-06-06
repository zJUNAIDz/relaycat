import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";

/**
 * Friendship / friend-request edge between two users.
 *
 *  - PENDING : requester has asked addressee, awaiting their response.
 *  - ACCEPTED: both are friends (direction no longer matters semantically).
 *  - BLOCKED : requester has blocked addressee. The blocker is always stored as
 *              `requesterId`, so a block overwrites/owns the row's direction.
 *
 * Exactly one row exists per unordered pair — callers must look the row up in
 * both directions (requester/addressee swapped) before inserting.
 */
export const friendshipStatuses = ["PENDING", "ACCEPTED", "BLOCKED"] as const;
export const friendshipStatusEnum = pgEnum(
  "friendship_status",
  friendshipStatuses,
);

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    requesterId: text("requester_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    addresseeId: text("addressee_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    status: friendshipStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("friendships_pair_uq").on(table.requesterId, table.addresseeId),
    index("friendships_requester_id_idx").on(table.requesterId),
    index("friendships_addressee_id_idx").on(table.addresseeId),
  ],
);

export const friendshipRelations = relations(friendships, ({ one }) => ({
  requester: one(user, {
    fields: [friendships.requesterId],
    references: [user.id],
  }),
  addressee: one(user, {
    fields: [friendships.addresseeId],
    references: [user.id],
  }),
}));

export const FriendshipStatus = friendshipStatuses.reduce(
  (acc, s) => {
    acc[s] = s;
    return acc;
  },
  {} as Record<
    (typeof friendshipStatuses)[number],
    (typeof friendshipStatuses)[number]
  >,
);

export type Friendship = typeof friendships.$inferSelect;
export type FriendshipInput = typeof friendships.$inferInsert;
export const friendshipSelectSchema = createSelectSchema(friendships);
export const friendshipInsertSchema = createInsertSchema(friendships);
