"use client";

import React from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./api";
import { useNotificationStore } from "./notification-store";

/** The unread badge count (re-renders only when the number changes). */
export function useUnreadCount(): number {
  return useNotificationStore((s) => s.unread);
}

/**
 * The notification list plus actions for a dropdown/inbox UI. Read-state changes
 * update the store optimistically and reconcile with the server's unread total.
 */
export function useNotifications() {
  const items = useNotificationStore((s) => s.items);
  const unread = useNotificationStore((s) => s.unread);
  const nextCursor = useNotificationStore((s) => s.nextCursor);
  const loaded = useNotificationStore((s) => s.loaded);
  const storeMarkRead = useNotificationStore((s) => s.markRead);
  const storeMarkAll = useNotificationStore((s) => s.markAllRead);
  const appendPage = useNotificationStore((s) => s.appendPage);
  const setUnread = useNotificationStore((s) => s.setUnread);

  const markRead = React.useCallback(
    async (id: string) => {
      const current = useNotificationStore.getState().items.find((i) => i.id === id);
      if (!current || current.read) return;
      storeMarkRead(id, Math.max(0, useNotificationStore.getState().unread - 1));
      try {
        setUnread(await markNotificationRead(id));
      } catch {
        /* keep optimistic state; next load reconciles */
      }
    },
    [storeMarkRead, setUnread],
  );

  const markAllRead = React.useCallback(async () => {
    storeMarkAll();
    try {
      await markAllNotificationsRead();
    } catch {
      /* keep optimistic state */
    }
  }, [storeMarkAll]);

  const loadMore = React.useCallback(async () => {
    if (!nextCursor) return;
    const res = await fetchNotifications(nextCursor);
    appendPage(res.notifications, res.nextCursor);
  }, [nextCursor, appendPage]);

  return {
    items,
    unread,
    loaded,
    hasMore: nextCursor !== null,
    markRead,
    markAllRead,
    loadMore,
  };
}
