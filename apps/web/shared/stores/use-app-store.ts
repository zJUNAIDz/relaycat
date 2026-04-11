"use client";

import { create } from "zustand";

interface AppContextState {
  currentServerId: string | null;
  currentChannelId: string | null;
  permissions: number | null; // bitmask from backend
  socketConnected: boolean;

  setServer: (id: string | null) => void;
  setChannel: (id: string | null) => void;
  setPermissions: (perm: number) => void;
  setSocketConnected: (state: boolean) => void;
}

export const useAppContextStore = create<AppContextState>((set) => ({
  currentServerId: null,
  currentChannelId: null,
  permissions: null,
  socketConnected: false,

  setServer: (id) => set({ currentServerId: id }),
  setChannel: (id) => set({ currentChannelId: id }),
  setPermissions: (perm) => set({ permissions: perm }),
  setSocketConnected: (state) => set({ socketConnected: state }),
}));
