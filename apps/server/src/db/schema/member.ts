import { pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";
import { servers } from "./server";
import { user } from "./auth-schema";

export const possibleMemberRoles = ["ADMIN", "MODERATOR", "MEMBER"] as const;
export const memberRole = pgEnum("member_role", possibleMemberRoles);
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  role: memberRole("role").default("ADMIN"),
  serverId: uuid("server_id")
    .references(() => servers.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
export type Member = typeof members.$inferSelect;
export type MemberWithUser = Member & {
  user: (typeof user.$inferSelect)[];
};
// get memberRole as const so I can use it in other files MemberRole.ADMIN
export const MemberRole = possibleMemberRoles.reduce(
  (acc, role) => {
    acc[role] = role;
    return acc;
  },
  {} as Record<(typeof possibleMemberRoles)[number], (typeof possibleMemberRoles)[number]>,
);
