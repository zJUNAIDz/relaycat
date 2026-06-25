"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps extends ImageProps {
  /** Shown when `src` is empty or fails to load (e.g. a deleted/broken image). */
  fallbackSrc: ImageProps["src"];
}

/**
 * `next/image` that swaps to a fallback when the source is missing or errors,
 * so a single broken upload never renders a clueless broken-image box.
 */
export const ImageWithFallback = ({
  src,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [lastSrc, setLastSrc] = useState(src);

  // Reset to the new source if `src` changes (e.g. after editing a server icon).
  if (src !== lastSrc) {
    setLastSrc(src);
    setCurrentSrc(src || fallbackSrc);
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
};
