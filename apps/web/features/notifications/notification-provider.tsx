"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { useSocket } from "@/shared/providers/socket-provider";
import type { NotificationEvent } from "@/shared/types";
import { notificationEvent } from "@/shared/types";
import React from "react";
import { fetchNotifications, fetchUnreadCount } from "./api";
import { useNotificationStore } from "./notification-store";

/**
 * Owns the live notification feed: loads recent history once on mount and then
 * mirrors server-pushed notifications into the store. Read-state mutations are
 * driven from the UI via {@link useNotifications}.
 *
 * Mount once inside the authenticated socket tree (alongside PresenceProvider).
 */
export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket } = useSocket();
  const userId = useAuth((s) => s.user?.id);
  const setAll = useNotificationStore((s) => s.setAll);
  const prepend = useNotificationStore((s) => s.prepend);
  const reset = useNotificationStore((s) => s.reset);

  // Initial history load (also gives us the authoritative unread count).
  React.useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([fetchNotifications(), fetchUnreadCount()])
      .then(([res, unread]) => {
        if (cancelled) return;
        setAll(res.notifications, unread, res.nextCursor);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, setAll]);

  // Live delivery on the per-user event name.
  React.useEffect(() => {
    if (!socket || !userId) return;
    const event = notificationEvent(userId);
    const onNotification = ({ notification, unread }: NotificationEvent) =>
      prepend(notification, unread);

    socket.on(event, onNotification);
    return () => {
      socket.off(event, onNotification);
    };
  }, [socket, userId, prepend]);

  // Clear on sign-out.
  React.useEffect(() => {
    if (!userId) reset();
  }, [userId, reset]);

  return <>{children}</>;
};
