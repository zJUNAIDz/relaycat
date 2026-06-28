"use client";

import { useSocket } from "@/shared/providers/socket-provider";
import type {
  PresenceSettableStatus,
  PresenceUpdate,
} from "@/shared/types";
import React from "react";
import { usePresenceStore } from "./presence-store";

const PREF_KEY = "relaycat:presence";
const HEARTBEAT_MS = 25_000;
// How long without interaction before we auto-flip an "online" user to "idle".
const IDLE_MS = 5 * 60_000;

const EVENTS = {
  update: "presence:update",
  sync: "presence:sync",
  self: "presence:self",
  subscribe: "presence:subscribe",
  unsubscribe: "presence:unsubscribe",
  set: "presence:set",
  heartbeat: "presence:heartbeat",
} as const;

function loadPreference(): PresenceSettableStatus {
  if (typeof window === "undefined") return "online";
  const v = window.localStorage.getItem(PREF_KEY);
  return v === "idle" || v === "dnd" || v === "invisible" ? v : "online";
}

/**
 * Owns the live presence connection: mirrors server events into the presence
 * store, keeps the connection's TTL warm with heartbeats, reports the user's
 * chosen status, and auto-flips an "online" user to "idle" after inactivity.
 *
 * Mount once inside the authenticated socket tree.
 */
export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket();
  const apply = usePresenceStore((s) => s.apply);
  const applyMany = usePresenceStore((s) => s.applyMany);
  const setSelf = usePresenceStore((s) => s.setSelf);
  const reset = usePresenceStore((s) => s.reset);

  // The user's explicit choice (vs. auto-idle). Survives reloads.
  const preferenceRef = React.useRef<PresenceSettableStatus>("online");
  // True while we've auto-flipped to "idle" without changing the preference.
  const autoIdleRef = React.useRef(false);

  React.useEffect(() => {
    if (!socket) return;
    preferenceRef.current = loadPreference();
    setSelf(preferenceRef.current);

    const onUpdate = (u: PresenceUpdate) => apply(u);
    const onSync = (list: PresenceUpdate[]) => applyMany(list);
    const onSelf = ({ status }: { status: PresenceSettableStatus }) => {
      // Server's view of our chosen status — trust it unless we're mid auto-idle.
      if (autoIdleRef.current) return;
      preferenceRef.current = status;
      setSelf(status);
    };
    const announce = () => socket.emit(EVENTS.set, preferenceRef.current);

    socket.on(EVENTS.update, onUpdate);
    socket.on(EVENTS.sync, onSync);
    socket.on(EVENTS.self, onSelf);
    socket.on("connect", announce);
    if (socket.connected) announce();

    const heartbeat = window.setInterval(() => {
      socket.emit(EVENTS.heartbeat);
    }, HEARTBEAT_MS);

    return () => {
      socket.off(EVENTS.update, onUpdate);
      socket.off(EVENTS.sync, onSync);
      socket.off(EVENTS.self, onSelf);
      socket.off("connect", announce);
      window.clearInterval(heartbeat);
      reset();
    };
  }, [socket, apply, applyMany, setSelf, reset]);

  // Auto-idle: only active when the user's explicit preference is "online".
  React.useEffect(() => {
    if (!socket) return;
    let timer: number | undefined;

    const goIdle = () => {
      if (preferenceRef.current !== "online" || autoIdleRef.current) return;
      autoIdleRef.current = true;
      socket.emit(EVENTS.set, "idle");
    };
    const goActive = () => {
      if (autoIdleRef.current) {
        autoIdleRef.current = false;
        socket.emit(EVENTS.set, "online");
      }
    };
    const bump = () => {
      goActive();
      window.clearTimeout(timer);
      timer = window.setTimeout(goIdle, IDLE_MS);
    };
    const onVisibility = () => (document.hidden ? goIdle() : bump());

    const activity = ["mousemove", "keydown", "pointerdown", "scroll", "touchstart"];
    activity.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    bump();

    return () => {
      window.clearTimeout(timer);
      activity.forEach((e) => window.removeEventListener(e, bump));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [socket]);

  return <>{children}</>;
};

/**
 * Subscribe to live presence for a set of users (e.g. the friends/members you
 * render). Idempotent; the server answers with a snapshot and then pushes
 * updates. Re-subscribes automatically on reconnect.
 */
export function useWatchPresence(userIds: (string | undefined | null)[]) {
  const { socket } = useSocket();
  const ids = Array.from(new Set(userIds.filter((id): id is string => !!id)));
  const key = ids.slice().sort().join(",");

  React.useEffect(() => {
    if (!socket || !ids.length) return;
    const subscribe = () => socket.emit("presence:subscribe", ids);
    subscribe();
    socket.on("connect", subscribe);
    return () => {
      socket.off("connect", subscribe);
    };
    // `key` captures the id set; `ids`/`socket` change with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, key]);
}

/** Set the current user's status from the picker. */
export function useSetPresence() {
  const { socket } = useSocket();
  const setSelf = usePresenceStore((s) => s.setSelf);

  return React.useCallback(
    (status: PresenceSettableStatus) => {
      setSelf(status);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PREF_KEY, status);
      }
      socket?.emit("presence:set", status);
    },
    [socket, setSelf],
  );
}
