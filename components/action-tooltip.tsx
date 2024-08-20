"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ActionTooltipProps {
  //TODO: Add support for Icons like in discord
  label: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label, children, side = "top", align = "center"
}) => {

  return (
    <TooltipProvider>
      <Tooltip delayDuration={15}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="font-bold text-lg" side={side} align={align}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}