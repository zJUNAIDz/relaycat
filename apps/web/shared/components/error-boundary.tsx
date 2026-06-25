"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorState } from "@/shared/components/error-state";
import { logError } from "@/shared/utils/error";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Label used when logging, e.g. the feature name. */
  scope?: string;
  /** Override the default fallback UI. Receives the error and a reset callback. */
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time crashes in any client subtree so one broken component
 * never takes down the whole app. Next.js `error.tsx` files only cover route
 * segments — use this to wrap widgets (sidebars, chat panes, etc.) that should
 * fail in isolation.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(this.props.scope ?? "ErrorBoundary", { error, info });
  }

  private reset = () => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset });
    }

    return <ErrorState onRetry={this.reset} />;
  }
}
