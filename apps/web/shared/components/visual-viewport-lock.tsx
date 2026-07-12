"use client"

import { pinToVisualViewport } from "@/shared/lib/visual-viewport";
import React from "react";

/** Mount inside a full-height view that must not scroll behind the soft keyboard. */
export const VisualViewportLock = () => {
  React.useEffect(() => pinToVisualViewport(), []);
  return null;
};
