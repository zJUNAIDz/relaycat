"use client";

import { ProfilePreview } from "@/features/profile/components/profile-preview";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { STEPS } from "../onboarding-machine";
import { useOnboarding } from "../use-onboarding";
import { AboutStep } from "./steps/about-step";
import { AppearanceStep } from "./steps/appearance-step";
import { IdentityStep } from "./steps/identity-step";
import { ServerStep } from "./steps/server-step";
import { WelcomeStep } from "./steps/welcome-step";

/** Dots rather than a bar: five steps is few enough to show discretely. */
const StepDots = ({ index }: { index: number }) => (
  <div className="flex items-center gap-1.5" aria-hidden>
    {STEPS.map((s, i) => (
      <span
        key={s}
        className={cn(
          "h-1.5 rounded-full transition-all",
          i === index ? "w-6 bg-brand" : "w-1.5 bg-muted-foreground/30",
          i < index && "bg-brand/50",
        )}
      />
    ))}
  </div>
);

export const OnboardingWizard = () => {
  const {
    step,
    index,
    draft,
    avatar,
    banner,
    authName,
    hydrated,
    busy,
    error,
    canAdvance,
    next,
    back,
  } = useOnboarding();

  // The machine fetches the profile itself on first subscribe.
  if (!hydrated) {
    return (
      <div className="w-full max-w-3xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const isWelcome = step === "welcome";
  const isServer = step === "server";
  // The preview only earns its space once there's an identity to preview.
  const showPreview = step === "identity" || step === "appearance" || step === "about";

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand">Relaycat</span>
        {!isWelcome && (
          <div className="flex items-center gap-3">
            <StepDots index={index} />
            <span className="text-xs text-muted-foreground">
              Step {index} of {STEPS.length - 1}
            </span>
          </div>
        )}
      </div>

      <div
        className={cn(
          "grid gap-8",
          showPreview && "lg:grid-cols-[1fr_320px]",
        )}
      >
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          {step === "welcome" && <WelcomeStep name={authName.split(" ")[0] ?? ""} />}
          {step === "identity" && <IdentityStep fallbackName={authName} />}
          {step === "appearance" && <AppearanceStep />}
          {step === "about" && <AboutStep />}
          {step === "server" && <ServerStep />}

          {error && (
            <p className="mt-6 flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          {/* The welcome and server steps own their own navigation. */}
          {!isWelcome && !isServer && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="ghost" disabled={busy} onClick={back}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button disabled={!canAdvance} onClick={() => void next()}>
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {busy ? "Saving…" : "Continue"}
                {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        {showPreview && (
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Preview
            </p>
            <ProfilePreview
              displayName={draft.displayName}
              username={draft.username || "username"}
              bio={draft.bio}
              pronouns={draft.pronouns}
              status={draft.status}
              accentColor={draft.accentColor}
              avatarUrl={avatar.preview}
              bannerUrl={banner.preview}
              links={[]}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
