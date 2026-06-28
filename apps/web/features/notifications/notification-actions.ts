import type { NotificationEvent } from "@/shared/types";
import { notificationService } from "./notification-service";
import { useNotificationStore } from "./notification-store";

/**
 * Plain, stable notification actions operating directly on the zustand store via
 * `getState()`. Kept out of React so components/hooks carry no `useCallback` and
 * no logic — they just call these module-level functions (stable references, no
 * stale closures). See [[avoid-react-lifecycle-for-logic]].
 */

const store = useNotificationStore;

/** Initial REST hydration: recent history + authoritative unread count. */
export async function loadInitialNotifications(): Promise<void> {
  const [res, unread] = await Promise.all([
    notificationService.list(),
    notificationService.unreadCount(),
  ]);
  store.getState().setAll(res.notifications, unread, res.nextCursor);
}

/** Socket handler: a live notification arrived. */
export function handleIncomingNotification({
  notification,
  unread,
}: NotificationEvent): void {
  store.getState().prepend(notification, unread);
}

/** Optimistically mark one read, then reconcile unread with the server. */
export async function markNotificationReadAction(id: string): Promise<void> {
  const s = store.getState();
  const current = s.items.find((i) => i.id === id);
  if (!current || current.read) return;
  s.markRead(id, Math.max(0, s.unread - 1));
  try {
    s.setUnread(await notificationService.markRead(id));
  } catch {
    /* keep optimistic state; next load reconciles */
  }
}

/** Optimistically mark all read, then sync with the server. */
export async function markAllNotificationsReadAction(): Promise<void> {
  store.getState().markAllRead();
  try {
    await notificationService.markAllRead();
  } catch {
    /* keep optimistic state */
  }
}

/** Page in older notifications using the stored cursor. */
export async function loadMoreNotifications(): Promise<void> {
  const s = store.getState();
  if (!s.nextCursor) return;
  const res = await notificationService.list(s.nextCursor);
  store.getState().appendPage(res.notifications, res.nextCursor);
}

/** Clear everything (sign-out). */
export function resetNotifications(): void {
  store.getState().reset();
}
