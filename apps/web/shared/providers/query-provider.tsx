"use client"

import "client-only";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
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

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line 
    window.__TANSTACK_QUERY_CLIENT__ = queryClient
  }
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}