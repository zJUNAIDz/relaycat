import { socketManager } from "@/lib/socket-manager";
import {
  CreateNotificationInput,
  notificationService,
} from "@/modules/notifications/service";
import { pushService } from "@/modules/push/service";
import { presenceStore } from "@/socket/presence/store";
import type { Notification } from "@repo/types";
import { notificationEvent } from "@repo/types";

/** In-app path a notification should open when clicked (web push + future deep-links). */
function notificationUrl(n: Notification): string {
  if (n.serverId && n.channelId) return `/channels/${n.serverId}/${n.channelId}`;
  if (n.channelId) return `/channels/me/${n.channelId}`;
  return "/channels/me";
}

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

  const { notification, unread } = res.data;
  socketManager.io.emit(notificationEvent(input.userId), { notification, unread });

  // Out-of-app reach: only push when the recipient has no live socket, so an
  // active user gets the in-app toast and an away/offline one gets an OS push —
  // never both. No-op when web push isn't configured (see lib/web-push).
  const connected = await presenceStore.isConnected(input.userId).catch(() => true);
  if (!connected) {
    void pushService.sendToUser(input.userId, {
      title: notification.title,
      body: notification.body,
      url: notificationUrl(notification),
      tag: notification.type,
    });
  }
}
