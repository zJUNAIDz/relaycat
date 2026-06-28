"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SETTABLE_PRESENCE_STATUSES, type PresenceSettableStatus } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { ChevronDown } from "lucide-react";
import { useSelfPresence } from "../presence-store";
import { useSetPresence } from "../presence-provider";
import { SETTABLE_META } from "../status-meta";

/**
 * Lets the user pick their own status (online/idle/dnd/invisible). Reflects the
 * current choice and writes through `useSetPresence`, which persists it and
 * tells the server.
 */
export const StatusPicker = ({ className }: { className?: string }) => {
  const self = useSelfPresence();
  const setPresence = useSetPresence();
  const current = SETTABLE_META[self];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition hover:bg-accent",
          className,
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full", current.dot)} />
        <span className="font-medium">{current.label}</span>
        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {SETTABLE_PRESENCE_STATUSES.map((status: PresenceSettableStatus) => {
          const meta = SETTABLE_META[status];
          return (
            <DropdownMenuItem
              key={status}
              onSelect={() => setPresence(status)}
              className="flex items-start gap-2"
            >
              <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", meta.dot)} />
              <span className="flex flex-col">
                <span className="text-sm">{meta.label}</span>
                {meta.hint && (
                  <span className="text-xs text-muted-foreground">{meta.hint}</span>
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
