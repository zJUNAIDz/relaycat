import type { PresenceSettableStatus, PresenceStatus } from "@/shared/types";

/** Display label + dot color for each presence status. */
export const STATUS_META: Record<
  PresenceStatus,
  { label: string; dot: string }
> = {
  online: { label: "Online", dot: "bg-green-500" },
  idle: { label: "Idle", dot: "bg-yellow-500" },
  dnd: { label: "Do Not Disturb", dot: "bg-red-500" },
  offline: { label: "Offline", dot: "bg-zinc-500" },
};

/** The options shown in the status picker (settable by the user). */
export const SETTABLE_META: Record<
  PresenceSettableStatus,
  { label: string; dot: string; hint?: string }
> = {
  online: { label: "Online", dot: "bg-green-500" },
  idle: { label: "Idle", dot: "bg-yellow-500" },
  dnd: { label: "Do Not Disturb", dot: "bg-red-500", hint: "Mutes notifications" },
  invisible: {
    label: "Invisible",
    dot: "bg-zinc-500",
    hint: "Appear offline",
  },
};

/** Human-friendly "Last seen ..." string from an ISO timestamp. */
export function formatLastSeen(iso: string | null): string {
  if (!iso) return "Offline";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Offline";
  const mins = Math.floor((Date.now() - then) / 60_000);
  if (mins < 1) return "Last seen just now";
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Last seen ${days}d ago`;
}
