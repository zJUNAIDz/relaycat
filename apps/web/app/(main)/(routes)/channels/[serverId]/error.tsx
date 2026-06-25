"use client";

import { useEffect } from "react";

import { ErrorState } from "@/shared/components/error-state";
import { getErrorMessage, logError } from "@/shared/utils/error";

/** Keeps a broken server/channel from taking down the whole app shell. */
const ServerError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    logError("channels/[serverId]/error", error);
  }, [error]);

  return (
    <ErrorState
      title="Couldn't load this server"
      description={getErrorMessage(error)}
      onRetry={reset}
      homeHref="/channels/me"
      homeLabel="Go to Direct Messages"
    />
  );
};

export default ServerError;
