import {v7 as uuidv7 } from "uuid";
import { char, numeric, pgTable, uuid } from "drizzle-orm/pg-core";

export const reactions = pgTable("reactions", {
  id: uuid("id").$defaultFn(() => uuidv7()).primaryKey(),
  count: numeric("count").notNull().default("1"),
  emoji: char("emoji").notNull(),
});
