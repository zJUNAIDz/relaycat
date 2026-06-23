import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import {
  profiles,
  type Profile,
  type ProfileWithUser,
} from "@/db/schema/profile";
import { s3Service } from "@/lib/s3";
import { USER_PROFILE_POLICY } from "@/config/uploads";
import { logger } from "@/lib/logger";
import { toMediaPath } from "@/utils/media";
import { eq } from "drizzle-orm";

export type UpdateProfileInput = Partial<
  Pick<
    Profile,
    | "displayName"
    | "bio"
    | "avatar"
    | "banner"
    | "accentColor"
    | "pronouns"
    | "status"
    | "links"
  >
>;

class ProfileService {
  /** Fetch a user's profile joined with their auth identity. */
  async getProfileByUserId(userId: string): Promise<ProfileWithUser | null> {
    try {
      const [row] = await db
        .select()
        .from(profiles)
        .innerJoin(user, eq(profiles.userId, user.id))
        .where(eq(profiles.userId, userId))
        .limit(1);
      if (!row) return null;
      return { ...row.profiles, user: row.user };
    } catch (err) {
      logger.error({ err, userId }, "[profileService/getProfileByUserId]");
      return null;
    }
  }

  /**
   * Ensure a profile row exists for a user, returning it. Idempotent: safe to
   * call from the better-auth create hook and as a lazy backfill. Seeds the
   * displayName from the auth name so the profile is never blank.
   */
  async ensureProfile(
    userId: string,
    fallbackName?: string,
  ): Promise<Profile | null> {
    try {
      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);
      if (existing[0]) return existing[0];

      const [created] = await db
        .insert(profiles)
        .values({ userId, displayName: fallbackName ?? null })
        // Another concurrent request may have inserted first.
        .onConflictDoNothing({ target: profiles.userId })
        .returning();
      if (created) return created;

      const [row] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);
      return row ?? null;
    } catch (err) {
      logger.error({ err, userId }, "[profileService/ensureProfile]");
      return null;
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput,
  ): Promise<Profile | null> {
    try {
      // Normalise media fields to storable keys (strip any host prefix).
      const patch: UpdateProfileInput = { ...data };
      if ("avatar" in patch) patch.avatar = toMediaPath(patch.avatar);
      if ("banner" in patch) patch.banner = toMediaPath(patch.banner);

      const [updated] = await db
        .update(profiles)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(profiles.userId, userId))
        .returning();
      return updated ?? null;
    } catch (err) {
      logger.error({ err, userId }, "[profileService/updateProfile]");
      return null;
    }
  }

  /**
   * Re-host an external OAuth avatar (Google/GitHub) into our own bucket and
   * store the resulting key on the profile. Runs fire-and-forget after sign-up
   * so we never serve from — or get rate limited by — the provider CDN.
   */
  async rehostExternalAvatar(userId: string, sourceUrl: string): Promise<void> {
    try {
      if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return;
      const result = await s3Service.uploadFromUrl(
        sourceUrl,
        USER_PROFILE_POLICY,
        `oauth-${userId}`,
      );
      if (!result.success) {
        logger.warn(
          { userId, error: result.error.message },
          "[profileService/rehostExternalAvatar] skipped",
        );
        return;
      }
      await db
        .update(profiles)
        .set({ avatar: result.data.key, updatedAt: new Date() })
        .where(eq(profiles.userId, userId));
      logger.info({ userId }, "[profileService/rehostExternalAvatar] done");
    } catch (err) {
      logger.error({ err, userId }, "[profileService/rehostExternalAvatar]");
    }
  }
}

export const profileService = new ProfileService();
