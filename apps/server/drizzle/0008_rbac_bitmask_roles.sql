CREATE TABLE "member_roles" (
	"member_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "member_roles_member_id_role_id_pk" PRIMARY KEY("member_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"server_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"permissions" bigint DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 1 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_roles_role_id_idx" ON "member_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "roles_server_id_idx" ON "roles" USING btree ("server_id");--> statement-breakpoint

-- owner_id is added nullable and backfilled first: it is NOT NULL with no default,
-- so adding it directly fails on any database that already has servers. The owner
-- is taken to be each server's earliest member — its creator, who is inserted at
-- creation time, before anyone can join by invite.
ALTER TABLE "servers" ADD COLUMN "owner_id" text;--> statement-breakpoint
UPDATE "servers" SET "owner_id" = (
	SELECT "m"."user_id" FROM "members" "m"
	WHERE "m"."server_id" = "servers"."id"
	ORDER BY "m"."created_at" ASC
	LIMIT 1
) WHERE "owner_id" IS NULL;--> statement-breakpoint
-- A server with no members has nobody to own it and is unreachable anyway; drop it
-- so the NOT NULL constraint below can be enforced.
DELETE FROM "servers" WHERE "owner_id" IS NULL;--> statement-breakpoint
ALTER TABLE "servers" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Every existing server gets its default @everyone role at position 0, carrying
-- DEFAULT_PERMISSIONS = VIEW_SERVER | SEND_MESSAGES | CREATE_INVITE = 416.
-- Keep this literal in sync with packages/types/permissions.ts.
INSERT INTO "roles" ("id", "server_id", "name", "permissions", "position", "is_default")
SELECT gen_random_uuid(), "s"."id", '@everyone', 416, 0, true FROM "servers" "s";--> statement-breakpoint
-- Enrol every existing member into their server's @everyone role. Note what is
-- deliberately NOT carried over: the old members.role enum defaulted to ADMIN, so
-- everyone who joined by invite was an admin. That grant is dropped on purpose —
-- authority now comes from servers.owner_id plus explicitly assigned roles.
INSERT INTO "member_roles" ("member_id", "role_id")
SELECT "m"."id", "r"."id"
FROM "members" "m"
JOIN "roles" "r" ON "r"."server_id" = "m"."server_id" AND "r"."is_default" = true
ON CONFLICT DO NOTHING;--> statement-breakpoint

ALTER TABLE "members" DROP COLUMN "role";--> statement-breakpoint
DROP TYPE "public"."member_role";
