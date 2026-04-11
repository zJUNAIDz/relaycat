"use client";

import { create } from "zustand";
import { authClient, Session, User } from "@/shared/lib/auth-client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  fetchSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  fetchSession: async () => {
    set({ isLoading: true });

    try {
      const { data, error } = await authClient.getSession();

      if (error) {
        return set({ error: error.message, user: null, session: null });
      }

      set({
        user: data?.user ?? null,
        session: data?.session ?? null,
        error: null,
      });
    } catch {
      set({
        error: "Network error - failed to fetch token",
        user: null,
        session: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),

  logout: () =>
    set({
      user: null,
      session: null,
      error: null,
    }),
}));
