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
  currentServerId: localStorage.getItem("lastServerId") || null,
  currentChannelId: localStorage.getItem("lastChannelId") || null,
  permissions: null,
  socketConnected: false,

  setServer: (id) => {
    set({ currentServerId: id });
    localStorage.setItem("lastServerId", id ?? "");
  },
  setChannel: (id) => {
    set({ currentChannelId: id });
    localStorage.setItem("lastChannelId", id ?? "");
  },
  setPermissions: (perm) => set({ permissions: perm }),
  setSocketConnected: (state) => set({ socketConnected: state }),
}));
