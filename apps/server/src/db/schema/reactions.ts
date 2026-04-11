import { randomUUIDv7 } from "bun";
import { char, numeric, pgTable, uuid } from "drizzle-orm/pg-core";

export const reactions = pgTable("reactions", {
  id: uuid("id").default(randomUUIDv7()).primaryKey(),
  count: numeric("count").notNull().default("1"),
  emoji: char("emoji").notNull(),
});
