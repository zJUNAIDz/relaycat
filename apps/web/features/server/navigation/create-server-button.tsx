"use client";

import { ActionTooltip } from "@/shared/components/action-tooltip";
import { useModal } from "@/shared/hooks/use-modal-store";
import { Plus } from "lucide-react";

export const CreateServerButton = () => {

  const { onOpen } = useModal();

  return (
    <div>
      <ActionTooltip
        side="right"
        align="center"
        label="Add a server"
      >
        <button className="group flex items-center" onClick={() => onOpen("createServer")}>
          <div className="flex mx-3 h-12 w-12 rounded-3xl group-hover:rounded-2xl transition-all overflow-hidden items-center justify-center bg-background group-hover:bg-success">
            <Plus className="group-hover:text-success-foreground transition text-success h-10 w-10" size="25" />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
}