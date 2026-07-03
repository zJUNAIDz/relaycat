import { index, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";
import { v7 as uuidv7 } from "uuid";
import type { Role as WireRole } from "@repo/types";
import { user } from "./auth-schema";
import { servers } from "./server";

export const members = pgTable(
  "members",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),

    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    serverId: uuid("server_id")
      .references(() => servers.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("members_user_id_idx").on(table.userId),
    index("members_server_id_idx").on(table.serverId),
  ],
);
export type Member = typeof members.$inferSelect;
export type MemberWithUser = Member & {
  user: typeof user.$inferSelect;
  roles: WireRole[];
};
