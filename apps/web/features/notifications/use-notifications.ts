"use client";

import {
  loadMoreNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "./notification-actions";
import { useNotificationStore } from "./notification-store";

/** The unread badge count (re-renders only when the number changes). */
export function useUnreadCount(): number {
  return useNotificationStore((s) => s.unread);
}

/**
 * The notification list plus actions for a dropdown/inbox UI. State comes from
 * the store; the actions are stable plain functions from `notification-actions`
 * (no `useCallback`, no logic in the component layer).
 */
export function useNotifications() {
  const items = useNotificationStore((s) => s.items);
  const unread = useNotificationStore((s) => s.unread);
  const nextCursor = useNotificationStore((s) => s.nextCursor);
  const loaded = useNotificationStore((s) => s.loaded);

  return {
    items,
    unread,
    loaded,
    hasMore: nextCursor !== null,
    markRead: markNotificationReadAction,
    markAllRead: markAllNotificationsReadAction,
    loadMore: loadMoreNotifications,
  };
}
