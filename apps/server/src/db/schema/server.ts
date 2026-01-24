import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { Channel } from "./channel";
import { Member } from "./member";

export const servers = pgTable("servers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  inviteCode: text("invite_code")
    .notNull()
    .unique()
    .default(sql`encode(gen_random_bytes(16), 'hex')`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
export const serverSelectSchema = createSelectSchema(servers);
export const serverInsertSchema = createInsertSchema(servers);
export type Server = typeof servers.$inferSelect;
export type ServerInput = typeof servers.$inferInsert;

export type ServerWithMembersAndChannels = Server & {
        members: Member[];
        channels: Channel[];
      };