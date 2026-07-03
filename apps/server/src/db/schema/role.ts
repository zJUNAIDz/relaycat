import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";
import { v7 as uuidv7 } from "uuid";
import { members } from "./member";
import { servers } from "./server";

/**
 * A server role. `permissions` is a Discord-style bitfield (see
 * packages/types/permissions.ts) stored as a Postgres `bigint`. `position`
 * orders the hierarchy — higher outranks lower; the default (@everyone) role
 * sits at position 0. Exactly one `isDefault` role exists per server.
 */
export const roles = pgTable(
  "roles",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    serverId: uuid("server_id")
      .references(() => servers.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    color: text("color"),
    // bigint permission bitfield; `mode: "bigint"` so Drizzle hands us a JS bigint.
    permissions: bigint("permissions", { mode: "bigint" })
      .default(sql`0`)
      .notNull(),
    position: integer("position").default(1).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("roles_server_id_idx").on(table.serverId)],
);

/** Join table assigning roles to members (a member may hold many roles). */
export const memberRoles = pgTable(
  "member_roles",
  {
    memberId: uuid("member_id")
      .references(() => members.id, { onDelete: "cascade" })
      .notNull(),
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    // Composite PK already guarantees a member holds each role at most once.
    primaryKey({ columns: [table.memberId, table.roleId] }),
    index("member_roles_role_id_idx").on(table.roleId),
  ],
);

export type Role = typeof roles.$inferSelect;
export type RoleInput = typeof roles.$inferInsert;
export type MemberRoleLink = typeof memberRoles.$inferSelect;
