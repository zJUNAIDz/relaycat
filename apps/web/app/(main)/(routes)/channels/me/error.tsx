"use client";

import { useEffect } from "react";

import { ErrorState } from "@/shared/components/error-state";
import { getErrorMessage, logError } from "@/shared/utils/error";

/** Error boundary for the Direct Messages area. */
const MeError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    logError("channels/me/error", error);
  }, [error]);

  return (
    <ErrorState
      title="Couldn't load your messages"
      description={getErrorMessage(error)}
      onRetry={reset}
      homeHref="/"
    />
  );
};

export default MeError;
