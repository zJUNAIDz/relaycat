import { profileService } from "@/services/profile.service";
import { ProtectedAppContext } from "@/types";
import { withResolvedMedia } from "@/utils/media";
import { UpdateProfileDTO } from "@repo/types";
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
  const updated = await profileService.updateProfile(user.id, data);
  if (!updated) {
    log.error({ userId: user.id, data }, "[PROFILE UPDATE FAILED]");
    return c.json({ error: "Failed to update profile" }, 500);
  }
  log.info({ userId: user.id }, "[PROFILE UPDATED]");

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
