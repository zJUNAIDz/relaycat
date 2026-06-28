"use client";

import type { Notification } from "@/shared/types";
import { create } from "zustand";

interface NotificationState {
  /** Loaded notifications, newest first. */
  items: Notification[];
  /** Unread count — the badge source of truth (kept in sync by the server). */
  unread: number;
  /** Cursor for loading older notifications; null when fully loaded. */
  nextCursor: string | null;
  loaded: boolean;

  /** Replace the list (initial REST load / refresh). */
  setAll: (items: Notification[], unread: number, nextCursor: string | null) => void;
  /** Append an older page. */
  appendPage: (items: Notification[], nextCursor: string | null) => void;
  /** A live notification arrived. */
  prepend: (item: Notification, unread: number) => void;
  /** Reflect a read-state change for one item. */
  markRead: (id: string, unread: number) => void;
  /** Reflect "mark all read". */
  markAllRead: () => void;
  /** Authoritative unread count from the server. */
  setUnread: (unread: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unread: 0,
  nextCursor: null,
  loaded: false,

  setAll: (items, unread, nextCursor) =>
    set({ items, unread, nextCursor, loaded: true }),

  appendPage: (items, nextCursor) =>
    set((s) => ({ items: [...s.items, ...items], nextCursor })),

  prepend: (item, unread) =>
    set((s) =>
      // Guard against the rare duplicate (e.g. double socket emit).
      s.items.some((i) => i.id === item.id)
        ? { unread }
        : { items: [item, ...s.items], unread },
    ),

  markRead: (id, unread) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
      unread,
    })),

  markAllRead: () =>
    set((s) => ({
      items: s.items.map((i) => ({ ...i, read: true })),
      unread: 0,
    })),

  setUnread: (unread) => set({ unread }),

  reset: () => set({ items: [], unread: 0, nextCursor: null, loaded: false }),
}));
