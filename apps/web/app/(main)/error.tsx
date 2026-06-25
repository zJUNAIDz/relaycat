"use client";

import { useEffect } from "react";

import { ErrorState } from "@/shared/components/error-state";
import { getErrorMessage, logError } from "@/shared/utils/error";

/** Error boundary for the authenticated app shell. */
const MainError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    logError("app/(main)/error", error);
  }, [error]);

  return (
    <ErrorState
      description={getErrorMessage(error)}
      onRetry={reset}
      homeHref="/channels/me"
      homeLabel="Go to Direct Messages"
    />
  );
};

export default MainError;
