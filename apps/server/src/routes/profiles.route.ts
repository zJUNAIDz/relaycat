import {
  profileService,
  UsernameTakenError,
} from "@/services/profile.service";
import { ProtectedAppContext } from "@/types";
import { withResolvedMedia } from "@/utils/media";
import { CheckUsernameDTO, UpdateProfileDTO } from "@repo/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const profilesRoute = new Hono<ProtectedAppContext>();

// Current user's profile (auto-created if missing).
profilesRoute.get("/me", async (c) => {
  const user = c.get("user");
  await profileService.ensureProfile(user.id, user.name);
  const profile = await profileService.getProfileByUserId(user.id);
  if (!profile) {
    return c.json({ error: "Profile not found" }, 404);
  }
  return c.json(withResolvedMedia(profile));
});

// Update the current user's profile.
profilesRoute.patch("/me", zValidator("json", UpdateProfileDTO), async (c) => {
  const user = c.get("user");
  const log = c.get("logger");
  const data = c.req.valid("json");

  await profileService.ensureProfile(user.id, user.name);

  let updated;
  try {
    updated = await profileService.updateProfile(user.id, data);
  } catch (err) {
    if (err instanceof UsernameTakenError) {
      return c.json({ error: err.message, field: "username" }, 409);
    }
    throw err;
  }

  if (!updated) {
    log.error({ userId: user.id, data }, "[PROFILE UPDATE FAILED]");
    return c.json({ error: "Failed to update profile" }, 500);
  }
  log.info({ userId: user.id }, "[PROFILE UPDATED]");

  const profile = await profileService.getProfileByUserId(user.id);
  return c.json(withResolvedMedia(profile));
});

// Live handle check for the onboarding/profile forms. Advisory: the unique index
// is the real arbiter, and the PATCH still 409s if someone claims it first.
// Registered before "/:userId" so it isn't swallowed by that wildcard.
profilesRoute.get(
  "/username-available",
  zValidator("query", CheckUsernameDTO),
  async (c) => {
    const user = c.get("user");
    const { username } = c.req.valid("query");
    const available = await profileService.isUsernameAvailable(
      username,
      user.id,
    );
    return c.json({ username: username.toLowerCase(), available });
  },
);

// Finish onboarding. Separate from PATCH /me on purpose: the app shell gates on
// this flag, so the client must never be able to set it as a normal field.
profilesRoute.post("/me/complete-onboarding", async (c) => {
  const user = c.get("user");
  const log = c.get("logger");

  await profileService.ensureProfile(user.id, user.name);
  const completed = await profileService.completeOnboarding(user.id);
  if (!completed) {
    log.error({ userId: user.id }, "[ONBOARDING COMPLETE FAILED]");
    return c.json({ error: "Failed to complete onboarding" }, 500);
  }
  log.info({ userId: user.id }, "[ONBOARDING COMPLETED]");

  const profile = await profileService.getProfileByUserId(user.id);
  return c.json(withResolvedMedia(profile));
});

// Read any user's profile (still behind auth). Backfills a row for legacy users
// who never had one so member/chat profile cards always resolve.
profilesRoute.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  await profileService.ensureProfile(userId);
  const profile = await profileService.getProfileByUserId(userId);
  if (!profile) {
    return c.json({ error: "Profile not found" }, 404);
  }
  return c.json(withResolvedMedia(profile));
});

export default profilesRoute;
