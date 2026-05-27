"use client"

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
const queryClient = new QueryClient()

// TypeScript only:
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
    import('@tanstack/react-query')
    .QueryClient
  }
}

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  if (isMounted && process.env.NODE_ENV === "development") {
    window.__TANSTACK_QUERY_CLIENT__ = queryClient
  }
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}