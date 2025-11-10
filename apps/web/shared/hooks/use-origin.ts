import React, { useEffect } from "react";

export const useOrigin = () => {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return "";
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  return origin;
};
