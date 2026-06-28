import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema/push-subscription";
import { logger } from "@/lib/logger";
import { webPushEnabled, webpush } from "@/lib/web-push";
import { eq } from "drizzle-orm";
import type { WebPushError } from "web-push";

/** The subscription shape the browser's PushManager produces. */
export type WebPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** What we send down to the service worker's `push` handler. */
export type PushPayload = {
  title: string;
  body?: string | null;
  /** In-app path to open when the notification is clicked. */
  url?: string;
  /** Coalescing key so repeat notifications replace rather than stack. */
  tag?: string;
};

class PushService {
  /** Upsert a subscription for a user (idempotent on re-subscribe). */
  async save(
    userId: string,
    sub: WebPushSubscription,
    userAgent?: string | null,
  ): Promise<void> {
    try {
      await db
        .insert(pushSubscriptions)
        .values({
          endpoint: sub.endpoint,
          userId,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          userAgent: userAgent ?? null,
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          // The same endpoint can be re-claimed by a different user on a shared
          // device — re-point it and refresh the rotated keys.
          set: {
            userId,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
            userAgent: userAgent ?? null,
          },
        });
    } catch (error) {
      logger.error({ error }, "[push/save]");
    }
  }

  /** Remove a single subscription by its endpoint (explicit unsubscribe). */
  async remove(endpoint: string): Promise<void> {
    try {
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } catch (error) {
      logger.error({ error }, "[push/remove]");
    }
  }

  /**
   * Encrypt + deliver a payload to every subscription a user owns. Dead
   * subscriptions (404 Not Found / 410 Gone) are pruned as we discover them.
   * Never throws — push is best-effort.
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!webPushEnabled) return;

    let subs;
    try {
      subs = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));
    } catch (error) {
      logger.error({ error }, "[push/sendToUser:list]");
      return;
    }
    if (subs.length === 0) return;

    const body = JSON.stringify(payload);
    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            body,
          );
        } catch (error) {
          const status = (error as WebPushError).statusCode;
          if (status === 404 || status === 410) {
            await this.remove(sub.endpoint);
          } else {
            logger.error({ error, status }, "[push/sendToUser:send]");
          }
        }
      }),
    );
  }
}

export const pushService = new PushService();
