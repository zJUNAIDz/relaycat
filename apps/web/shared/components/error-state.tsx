"use client";

import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/cn";

interface ErrorStateProps {
  /** Small label above the title, e.g. "404" or "Error". */
  eyebrow?: string;
  title?: string;
  description?: string;
  /** When provided, renders a "Try again" button wired to this callback. */
  onRetry?: () => void;
  /** Where the "Go home" link points. */
  homeHref?: string;
  homeLabel?: string;
  className?: string;
}

/**
 * Consistent, friendly error UI shared by route error boundaries, the
 * not-found page, and the in-app <ErrorBoundary />. Keeps every failure
 * looking intentional instead of a clueless "something went wrong" screen.
 */
export const ErrorState = ({
  eyebrow = "Error",
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again, or head back to a safe place.",
  onRetry,
  homeHref = "/",
  homeLabel = "Go home",
  className,
}: ErrorStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full items-center justify-center p-6",
        className,
      )}
    >
      <Card className="w-full max-w-md border-border/70 bg-background/95 shadow-sm">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <AlertTriangleIcon className="h-5 w-5" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row">
          {onRetry && (
            <Button onClick={onRetry}>
              <RotateCwIcon aria-hidden />
              Try again
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
