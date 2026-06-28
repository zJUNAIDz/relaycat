import { socketManager } from "@/lib/socket-manager";
import {
  CreateNotificationInput,
  notificationService,
} from "@/modules/notifications/service";
import { notificationEvent } from "@repo/types";

/**
 * Raise a notification: persist it, then push it live to the recipient.
 *
 * This is the single entry point routes call when something notification-worthy
 * happens (a DM, a mention, a friend request). Persistence is the source of
 * truth (so offline users see it later); the socket emit is best-effort live
 * delivery on the per-user event name, matching the friends-module convention.
 *
 * Fire-and-forget friendly: never throws — a failed notification must not fail
 * the action that triggered it.
 */
export async function notify(input: CreateNotificationInput): Promise<void> {
  // Don't notify yourself (e.g. messaging in a channel you're mentioned in).
  if (input.actorId && input.actorId === input.userId) return;

  const res = await notificationService.create(input);
  if (!res.ok) return;

  socketManager.io.emit(notificationEvent(input.userId), {
    notification: res.data.notification,
    unread: res.data.unread,
  });
}
