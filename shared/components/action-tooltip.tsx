"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/shared/components/ui/tooltip";
import { cn } from "../utils/cn";

interface ActionTooltipProps {
  //TODO: Add support for Icons like in discord
  label: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label, children, side = "top", align = "center", className
}) => {

  return (
    <TooltipProvider>
      <Tooltip delayDuration={15}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className={cn("font-bold text-lg", className)} side={side} align={align}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}