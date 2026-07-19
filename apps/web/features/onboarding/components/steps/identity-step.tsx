"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/utils/cn";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useOnboarding } from "../../use-onboarding";

/** Inline feedback for the live handle check — the one blocking field here. */
const UsernameHint = () => {
  const { usernameCheck } = useOnboarding();

  switch (usernameCheck.state) {
    case "checking":
      return (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Checking availability…
        </p>
      );
    case "available":
      return (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <Check className="h-3 w-3" /> That one&apos;s free — nice pick.
        </p>
      );
    case "taken":
      return (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> Someone already has that handle.
        </p>
      );
    case "invalid":
      return (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {usernameCheck.reason}
        </p>
      );
    default:
      return (
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, dot or underscore. This is how friends find
          you.
        </p>
      );
  }
};

export const IdentityStep = ({ fallbackName }: { fallbackName: string }) => {
  const { draft, setField, usernameCheck, busy } = useOnboarding();

  const invalid =
    usernameCheck.state === "taken" || usernameCheck.state === "invalid";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-bold">Claim your handle</h2>
        <p className="text-sm text-muted-foreground">
          Your username is unique across Relaycat. Your display name is what
          people actually see.
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            @
          </span>
          <Input
            id="username"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="your_handle"
            disabled={busy}
            className={cn("pl-7", invalid && "border-destructive")}
            value={draft.username}
            // Normalise as they type so what they see is what gets stored.
            onChange={(e) =>
              setField("username", e.target.value.trim().toLowerCase())
            }
          />
        </div>
        <UsernameHint />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          placeholder={fallbackName || "Your name"}
          disabled={busy}
          value={draft.displayName}
          onChange={(e) => setField("displayName", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Optional — we&apos;ll fall back to your username.
        </p>
      </div>
    </div>
  );
};
