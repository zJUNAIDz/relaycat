import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";

/**
 * Decoupled "fun stuff" profile, intentionally separate from the better-auth
 * managed `user` table. better-auth owns identity/auth columns; everything
 * cosmetic and social lives here so we can evolve it freely without touching
 * auth internals.
 *
 * Image columns (`avatar`, `banner`) store only the S3 object *key* — the
 * public host is prepended at read time via `withResolvedMedia`.
 */
export type ProfileLink = { label: string; url: string };

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    // Unique, user-facing handle used to find and add friends. Nullable so
    // existing rows backfill lazily; set via the profile editor.
    username: text("username").unique(),
    displayName: text("display_name"),
    bio: text("bio"),
    avatar: text("avatar"),
    banner: text("banner"),
    accentColor: text("accent_color"),
    pronouns: text("pronouns"),
    status: text("status"),
    links: jsonb("links").$type<ProfileLink[]>().default([]).notNull(),
    //it must be set exactly once, by the dedicated completion endpoint, never from the generic profile PATCH.
    onboardingCompletedAt: timestamp("onboarding_completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("profiles_user_id_idx").on(table.userId),
    index("profiles_username_idx").on(table.username),
  ],
);

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
}));

export const profileSelectSchema = createSelectSchema(profiles);
export const profileInsertSchema = createInsertSchema(profiles);

export type Profile = typeof profiles.$inferSelect;
export type ProfileInput = typeof profiles.$inferInsert;
export type ProfileWithUser = Profile & { user: typeof user.$inferSelect };
