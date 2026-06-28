"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { useSocket } from "@/shared/providers/socket-provider";
import { notificationEvent } from "@/shared/types";
import React from "react";
import {
  handleIncomingNotification,
  loadInitialNotifications,
  resetNotifications,
} from "./notification-actions";

/**
 * Binds the notification feed to the authenticated socket: hydrates history and
 * subscribes to live delivery while signed in, and clears on sign-out. All the
 * work lives in `notification-actions`; this is the minimal glue that ties those
 * plain functions to the socket/user that only React context can provide.
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

  React.useEffect(() => {
    if (!userId) {
      resetNotifications();
      return;
    }

    // Hydrate (also resyncs after a socket reconnect).
    void loadInitialNotifications();

    if (!socket) return;
    const event = notificationEvent(userId);
    socket.on(event, handleIncomingNotification);
    return () => {
      socket.off(event, handleIncomingNotification);
    };
  }, [socket, userId]);

  return <>{children}</>;
};
