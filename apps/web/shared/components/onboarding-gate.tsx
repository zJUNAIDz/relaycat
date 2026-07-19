"use client";

import { useMyProfile } from "@/features/profile/hooks/profile-mutations";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Gates the app shell on a finished profile. Sits inside `AuthGuard` (so a
 * session is guaranteed) and outside the `(onboarding)` route group (so the
 * wizard itself is never gated by it).
 *
 * Fails open: if the profile can't be fetched we render the app rather than
 * trapping the user in a loading state over a transient network blip.
 */
export const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: profile, isLoading } = useMyProfile();

  const needsOnboarding = !!profile && !profile.onboardingCompletedAt;

  useEffect(() => {
    if (needsOnboarding) router.replace(PAGE_ROUTES.ONBOARDING);
  }, [needsOnboarding, router]);

  if (isLoading || needsOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-card">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand" />
      </div>
    );
  }

  return <>{children}</>;
};
