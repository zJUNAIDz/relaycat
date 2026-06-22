"use client";

import React, { useEffect } from "react";
import { authClient, Session, User } from "../lib/auth-client";
import { useAuth } from "../stores/use-auth";

// Re-export so existing `import { useAuth } from "@/shared/providers/auth-provider"`
// keeps working while the zustand store is the single source of truth.
export { useAuth } from "../stores/use-auth";

/**
 * Subscribes to Better Auth's reactive session and mirrors it into the zustand
 * store. Mounting this once (in the root layout) keeps auth state in sync across
 * the whole app — including after sign-in, sign-out and email verification.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isPending, error } = authClient.useSession();
  const sync = useAuth((state) => state.sync);

  useEffect(() => {
    sync({
      user: (data?.user as User | undefined) ?? null,
      session: (data?.session as Session | undefined) ?? null,
      isPending,
      error: error
        ? new Error(error.message ?? "Error while fetching session")
        : null,
    });
  }, [data, isPending, error, sync]);

  return <>{children}</>;
};
