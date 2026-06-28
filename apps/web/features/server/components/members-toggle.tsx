"use client";
import { ActionTooltip } from "@/shared/components/action-tooltip";
import { cn } from "@/shared/utils/cn";
import { Users } from "lucide-react";
import { useMembersSidebar } from "../hooks/use-members-sidebar";

/**
 * Header button that shows/hides the right-hand member list. Lives in the chat
 * header for server channels only.
 */
export const MembersToggle = () => {
  const { isOpen, toggle } = useMembersSidebar();
  return (
    <ActionTooltip
      side="bottom"
      label={isOpen ? "Hide Member List" : "Show Member List"}
    >
      <button
        onClick={toggle}
        aria-pressed={isOpen}
        className={cn(
          "transition text-muted-foreground hover:text-foreground",
          isOpen && "text-foreground",
        )}
      >
        <Users className="h-5 w-5" />
      </button>
    </ActionTooltip>
  );
};
