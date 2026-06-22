"use client";

import { create } from "zustand";
import { authClient, Session, User } from "@/shared/lib/auth-client";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  isLoading: boolean;
  error: Error | null;

  /**
   * Mirror Better Auth's reactive session into the store. Called by
   * AuthProvider whenever `authClient.useSession()` changes, so the whole app
   * reads a single, always-fresh source of truth.
   */
  sync: (input: {
    user: User | null;
    session: Session | null;
    isPending: boolean;
    error: Error | null;
  }) => void;

  /** Sign out and clear local state immediately. */
  signOut: () => Promise<void>;

  /** Force a session refetch (updates Better Auth's store -> re-syncs here). */
  refetch: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  status: "loading",
  isLoading: true,
  error: null,

  sync: ({ user, session, isPending, error }) =>
    set({
      user,
      session,
      error,
      isLoading: isPending,
      status: isPending
        ? "loading"
        : user
          ? "authenticated"
          : "unauthenticated",
    }),

  signOut: async () => {
    try {
      await authClient.signOut();
    } finally {
      set({
        user: null,
        session: null,
        status: "unauthenticated",
        isLoading: false,
        error: null,
      });
    }
  },

  refetch: async () => {
    // getSession() updates Better Auth's shared session store, which
    // AuthProvider observes via useSession() and pushes back through sync().
    await authClient.getSession();
  },
}));
