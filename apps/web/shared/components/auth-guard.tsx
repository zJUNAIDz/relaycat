"use client";

import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Gates the protected app shell. While the session is resolving it shows a
 * loader; once resolved, unauthenticated users are redirected to /auth and the
 * children are never rendered (so protected UI never flashes or fires API
 * calls without a session).
 */
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(PAGE_ROUTES.AUTH);
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
      </div>
    );
  }

  return <>{children}</>;
};
