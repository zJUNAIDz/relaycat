"use client";

import { useSyncExternalStore } from "react";
import { onboardingMachine, STEPS } from "./onboarding-machine";

/**
 * Thin React binding over {@link onboardingMachine}. All wizard logic — step
 * sequencing, the debounced handle check, save/finish orchestration — lives in
 * the plain machine; this hook only mirrors its snapshot and hands back the
 * actions. No effects, no local state, no stale closures.
 */
export function useOnboarding() {
  const state = useSyncExternalStore(
    onboardingMachine.subscribe,
    onboardingMachine.getSnapshot,
    onboardingMachine.getServerSnapshot,
  );

  return {
    ...state,
    totalSteps: STEPS.length,
    canAdvance: onboardingMachine.canAdvance(),
    setField: onboardingMachine.setField,
    setImage: onboardingMachine.setImage,
    next: onboardingMachine.next,
    back: onboardingMachine.back,
    goTo: onboardingMachine.goTo,
    finish: onboardingMachine.finish,
  };
}
