"use client";

import { useSocket } from "@/shared/providers/socket-provider";
import { TYPING_EVENTS, type TypingUpdate } from "@/shared/types";
import React from "react";

// Re-send a `start` at most this often while the user keeps typing.
const THROTTLE_MS = 3_000;
// Auto-send `stop` this long after the last keystroke.
const STOP_AFTER_MS = 4_000;
// Drop a typer if no refresh arrives within this window (covers missed stops).
const TYPER_TTL_MS = 6_000;

/**
 * Returns a `notify()` to call on each keystroke in `chatId`. Emits a throttled
 * `typing:start` and schedules a `typing:stop` once typing pauses (also fired on
 * unmount). The notifier never joins the room — `socket.to(room)` reaches the
 * viewers regardless of the sender's membership.
 */
export function useTypingNotifier(chatId: string, name: string) {
  const { socket } = useSocket();
  const lastStartRef = React.useRef(0);
  const stopTimerRef = React.useRef<number | undefined>(undefined);

  const stop = React.useCallback(() => {
    window.clearTimeout(stopTimerRef.current);
    if (!lastStartRef.current) return;
    lastStartRef.current = 0;
    socket?.emit(TYPING_EVENTS.stop, { chatId });
  }, [socket, chatId]);

  const notify = React.useCallback(() => {
    if (!socket) return;
    const now = Date.now();
    if (now - lastStartRef.current > THROTTLE_MS) {
      lastStartRef.current = now;
      socket.emit(TYPING_EVENTS.start, { chatId, name });
    }
    window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = window.setTimeout(stop, STOP_AFTER_MS);
  }, [socket, chatId, name, stop]);

  // Make sure we don't leave a stale "typing…" behind on navigation/unmount.
  React.useEffect(() => stop, [stop]);

  return notify;
}

/** A typer plus the wall-clock time its entry should expire. */
type ActiveTyper = { name: string; expiresAt: number };

/**
 * Live list of display names currently typing in `chatId` (excluding the
 * current user). Joins the chat's typing room on mount and prunes entries whose
 * TTL lapses, so a missed `stop` self-heals.
 */
export function useTypers(chatId: string, currentUserId: string): string[] {
  const { socket } = useSocket();
  const [typers, setTypers] = React.useState<Map<string, ActiveTyper>>(
    () => new Map(),
  );

  React.useEffect(() => {
    if (!socket) return;

    const join = () => socket.emit(TYPING_EVENTS.subscribe, chatId);
    join();
    socket.on("connect", join);

    const onUpdate = (u: TypingUpdate) => {
      if (u.chatId !== chatId || u.userId === currentUserId) return;
      setTypers((prev) => {
        const next = new Map(prev);
        if (u.typing) {
          next.set(u.userId, { name: u.name, expiresAt: Date.now() + TYPER_TTL_MS });
        } else {
          next.delete(u.userId);
        }
        return next;
      });
    };
    socket.on(TYPING_EVENTS.update, onUpdate);

    // Drop typers whose TTL lapsed (covers a `stop` that never arrived).
    const sweep = window.setInterval(() => {
      const now = Date.now();
      setTypers((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const [id, t] of next) {
          if (t.expiresAt <= now) {
            next.delete(id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, TYPER_TTL_MS);

    return () => {
      socket.emit(TYPING_EVENTS.unsubscribe, chatId);
      socket.off("connect", join);
      socket.off(TYPING_EVENTS.update, onUpdate);
      window.clearInterval(sweep);
      setTypers(new Map());
    };
  }, [socket, chatId, currentUserId]);

  return Array.from(typers.values(), (t) => t.name);
}
