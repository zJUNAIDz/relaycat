"use client";

import { ActionTooltip } from "@/shared/components/action-tooltip";
import { useModal } from "@/shared/hooks/use-modal-store";
import { Plus } from "lucide-react";

export const NavigationAction = () => {

  const { onOpen } = useModal();

  return (
    <div>
      <ActionTooltip
        side="right"
        align="center"
        label="Add a server"
      >
        <button className="group flex items-center" onClick={() => onOpen("createServer")}>
          {/*//TODO loose px */}
          <div className="flex mx-3 h-12 w-12 rounded-3xl group-hover:rounded-2xl transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
            <Plus className="group-hover:text-white transition text-emerald-500 h-10 w-10" size="25" />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
}