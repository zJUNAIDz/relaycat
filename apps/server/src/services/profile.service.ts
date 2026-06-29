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
import { eq, inArray } from "drizzle-orm";

export type UpdateProfileInput = Partial<
  Pick<
    Profile,
    | "username"
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

/**
 * The slice of a profile needed to render someone's identity in lists (members,
 * chat authors). `displayName`/`avatar` override the auth name/image; the rest
 * are cosmetic extras. Image keys are unresolved here — resolve at the response
 * boundary via `withResolvedMedia`.
 */
export type ProfileSummary = {
  userId: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  status: string | null;
  pronouns: string | null;
  accentColor: string | null;
};

/** Minimal auth-user shape an overlay touches (id stays put; name/image swap). */
type OverlayableUser = { id: string; name: string; image: string | null };

/**
 * Overlay a profile summary onto an auth user: the profile's `displayName` and
 * `avatar` become the user's display identity, falling back to the auth values
 * when unset. Non-destructive — returns a new object.
 */
export function applyProfileToUser<T extends OverlayableUser>(
  authUser: T,
  summary?: ProfileSummary,
): T {
  if (!summary) return authUser;
  return {
    ...authUser,
    name: summary.displayName ?? authUser.name,
    image: summary.avatar ?? authUser.image,
  };
}

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
   * Batch-fetch profile summaries for a set of users, keyed by userId. Used to
   * overlay display identity onto member lists and chat authors in one query.
   * Users without a profile row are simply absent from the map.
   */
  async getProfileSummaries(
    userIds: string[],
  ): Promise<Map<string, ProfileSummary>> {
    const map = new Map<string, ProfileSummary>();
    const ids = [...new Set(userIds)].filter(Boolean);
    if (ids.length === 0) return map;
    try {
      const rows = await db
        .select({
          userId: profiles.userId,
          username: profiles.username,
          displayName: profiles.displayName,
          avatar: profiles.avatar,
          status: profiles.status,
          pronouns: profiles.pronouns,
          accentColor: profiles.accentColor,
        })
        .from(profiles)
        .where(inArray(profiles.userId, ids));
      for (const row of rows) map.set(row.userId, row);
    } catch (err) {
      logger.error({ err }, "[profileService/getProfileSummaries]");
    }
    return map;
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
