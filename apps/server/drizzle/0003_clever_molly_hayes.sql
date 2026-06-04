ALTER TABLE "servers" ADD COLUMN "banner" text;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "member_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;