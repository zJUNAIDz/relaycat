import { Loader2Icon } from "lucide-react";

import { cn } from "@/shared/utils/cn";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** Centered spinner used by route `loading.tsx` files and Suspense fallbacks. */
export const LoadingState = ({
  label = "Loading…",
  className,
}: LoadingStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2Icon className="size-6 animate-spin" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
};
