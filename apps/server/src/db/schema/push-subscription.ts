import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * A single Web Push subscription: one browser/device that has granted this user
 * permission to receive push notifications while the app isn't focused (or is
 * fully closed).
 *
 * A user can have many subscriptions (laptop + phone + work machine), so the
 * `endpoint` — the push service URL the browser minted, globally unique — is the
 * primary key. The `p256dh`/`auth` keys are the client's public encryption
 * material; `web-push` uses them to encrypt each payload end-to-end so the push
 * service relaying it can't read the contents.
 *
 * Subscriptions expire/rotate on their own; we prune dead ones lazily when a
 * send returns 404/410 (see push service `sendToUser`).
 */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    // The push service endpoint URL — globally unique per subscription.
    endpoint: text("endpoint").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    // Client public key + auth secret for payload encryption.
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    // Best-effort label for the device, for a future "manage devices" UI.
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Hot path: "every subscription for this recipient" when fanning out a push.
    index("push_subscriptions_user_id_idx").on(table.userId),
  ],
);

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type PushSubscriptionInput = typeof pushSubscriptions.$inferInsert;
