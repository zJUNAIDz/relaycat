"use client";

import type {
  PresenceSettableStatus,
  PresenceStatus,
  PresenceUpdate,
} from "@/shared/types";
import { create } from "zustand";

interface PresenceEntry {
  status: PresenceStatus;
  lastSeen: string | null;
}

interface PresenceState {
  /** Public presence for everyone we're watching, keyed by userId. */
  presence: Record<string, PresenceEntry>;
  /** This user's own chosen status (mirrors the picker; "online" default). */
  self: PresenceSettableStatus;

  apply: (update: PresenceUpdate) => void;
  applyMany: (updates: PresenceUpdate[]) => void;
  setSelf: (status: PresenceSettableStatus) => void;
  reset: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  presence: {},
  self: "online",

  apply: (u) =>
    set((s) => ({
      presence: { ...s.presence, [u.userId]: { status: u.status, lastSeen: u.lastSeen } },
    })),

  applyMany: (updates) =>
    set((s) => {
      const next = { ...s.presence };
      for (const u of updates) next[u.userId] = { status: u.status, lastSeen: u.lastSeen };
      return { presence: next };
    }),

  setSelf: (status) => set({ self: status }),

  reset: () => set({ presence: {}, self: "online" }),
}));

/** Presence for one user — defaults to offline until the server reports otherwise. */
export function usePresence(userId: string | undefined | null): PresenceEntry {
  return usePresenceStore((s) =>
    userId ? s.presence[userId] : undefined,
  ) ?? { status: "offline", lastSeen: null };
}

/** This user's own chosen status (for the status picker). */
export function useSelfPresence(): PresenceSettableStatus {
  return usePresenceStore((s) => s.self);
}
