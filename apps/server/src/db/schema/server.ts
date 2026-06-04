import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";
import { Channel } from "./channel";
import { Member } from "./member";

export const servers = pgTable(
  "servers",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    name: text("name").notNull(),
    image: text("image"),
    inviteCode: text("invite_code")
      .notNull()
      .unique()
      .$defaultFn(() => uuidv7().replace(/-/g, "").slice(0, 8)),
    banner: text("banner"),
    description: text("description"),
    memberCount: integer("member_count").default(0).notNull(),
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("servers_invite_code_idx").on(table.inviteCode)],
);
export const serverSelectSchema = createSelectSchema(servers);
export const serverInsertSchema = createInsertSchema(servers);
export type Server = typeof servers.$inferSelect;
export type ServerInput = typeof servers.$inferInsert;

export type MemberWithUser = Member & { user: typeof user.$inferSelect };
export type ServerWithMembersAndUsersAndChannels = Server & {
  members: MemberWithUser[];
  channels: Channel[];
};
