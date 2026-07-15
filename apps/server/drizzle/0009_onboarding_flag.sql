ALTER TABLE "profiles" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
-- Existing users already picked a handle through the profile editor, so don't
-- drag them back through the wizard: treat a set username as "already onboarded".
UPDATE "profiles" SET "onboarding_completed_at" = "created_at" WHERE "username" IS NOT NULL;--> statement-breakpoint
-- Pre-existing schema drift, caught by this diff: `members` never had the
-- uniqueness its code assumes (one membership per user per server). Drop any
-- duplicates — keeping the earliest — before the constraint can be enforced.
DELETE FROM "members" a USING "members" b
  WHERE a."user_id" = b."user_id"
    AND a."server_id" = b."server_id"
    AND a."created_at" > b."created_at";--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_server_user_uq" UNIQUE("user_id","server_id");
