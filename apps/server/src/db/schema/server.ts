import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import { user } from "./auth-schema";
import { Channel } from "./channel";
import { Member } from "./member";

export const servers = pgTable("servers", {
  id: uuid("id").$defaultFn(() => uuidv7()).primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  inviteCode: text("invite_code")
    .notNull()
    .unique()
    .$defaultFn(() => uuidv7().replace(/-/g, "").slice(0, 8)),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
export const serverSelectSchema = createSelectSchema(servers);
export const serverInsertSchema = createInsertSchema(servers);
export type Server = typeof servers.$inferSelect;
export type ServerInput = typeof servers.$inferInsert;

export type MemberWithUser = Member & { user: typeof user.$inferSelect };
export type ServerWithMembersAndUsersAndChannels = {
  server: Server;
  members: MemberWithUser[];
  channels: Channel[];
};
