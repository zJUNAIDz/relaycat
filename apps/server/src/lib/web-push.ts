import webpush from "web-push";
import { logger } from "./logger";

/**
 * Web Push is optional, mirroring the Redis pattern: when the VAPID key pair is
 * configured, offline recipients get OS-level push notifications; when it's
 * absent the app still boots and the notifier simply skips the push step (live
 * socket delivery + the persisted inbox are unaffected).
 *
 * Generate a key pair once with `bunx web-push generate-vapid-keys` and set
 * `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (and optionally `VAPID_SUBJECT`, a
 * `mailto:` or URL the push services can contact you at). The public key is also
 * served to the browser so it can create subscriptions bound to this server.
 */
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT!;

export const webPushEnabled = Boolean(publicKey && privateKey);

/** The VAPID public key handed to the browser, or null when push is disabled. */
export const vapidPublicKey = publicKey ?? null;

if (webPushEnabled) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
  logger.info("[web-push] enabled");
} else {
  logger.warn(
    "[web-push] VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY not set — web push disabled",
  );
}

export { webpush };
