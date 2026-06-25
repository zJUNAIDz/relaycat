"use client";

import "client-only";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage, logError } from "@/shared/utils/error";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/react-query").QueryClient;
  }
}

/** Client errors (4xx) won't fix themselves, so don't waste retries on them. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) return false;
  }
  return failureCount < 2;
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    // Queries render their own inline error states / boundaries, so we only log.
    queryCache: new QueryCache({
      onError: (error) => logError("query", error),
    }),
    // Mutations are user actions — surface a toast by default. A mutation can
    // opt out (to show its own message) with `meta: { silent: true }`.
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        logError("mutation", error);
        if (mutation.meta?.silent) return;
        toast.error(getErrorMessage(error));
      },
    }),
  });
}

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  // Create the client once per browser session (never recreate on re-render).
  const [queryClient] = useState(makeQueryClient);

  // Expose the client for the React Query devtools in development only.
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      window.__TANSTACK_QUERY_CLIENT__ = queryClient;
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
