"use client";

import { useSyncExternalStore } from "react";
import { pushManager } from "./push-manager";

/**
 * Thin React binding over {@link pushManager}. All push logic (support
 * detection, subscribe/unsubscribe, state) lives in the plain manager; this
 * hook only mirrors its snapshot and hands back the actions — no effects, no
 * local state, no stale closures.
 */
export function useWebPush() {
  const { status, busy } = useSyncExternalStore(
    pushManager.subscribe,
    pushManager.getSnapshot,
    pushManager.getServerSnapshot,
  );

  return { status, busy, enable: pushManager.enable, disable: pushManager.disable };
}
