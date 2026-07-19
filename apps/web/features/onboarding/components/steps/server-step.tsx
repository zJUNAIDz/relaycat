"use client";

import { profileKeys } from "@/features/profile/hooks/profile-mutations";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useModal } from "@/shared/hooks/use-modal-store";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { cn } from "@/shared/utils/cn";
import { useQueryClient } from "@tanstack/react-query";
import { Compass, Loader2, Plus, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useOnboarding } from "../../use-onboarding";

/**
 * Invite links are pasted as often as they're typed. Accept both a bare code
 * and a full `…/invite/<code>` URL, and hand back just the code.
 */
export function parseInviteCode(input: string): string {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/invite\/([^/?#\s]+)/i);
  return (fromUrl?.[1] ?? trimmed).replace(/^\/+|\/+$/g, "");
}

type Choice = "create" | "join" | "discover";

export const ServerStep = () => {
  const { finish, busy } = useOnboarding();
  const router = useRouter();
  const onOpenModal = useModal((s) => s.onOpen);
  const queryClient = useQueryClient();

  const [choice, setChoice] = useState<Choice | null>(null);
  const [inviteInput, setInviteInput] = useState("");

  /**
   * Every path out of this step finalises onboarding *before* navigating —
   * otherwise the app shell's gate would bounce the user straight back here.
   * The completed profile is written into the cache for the same reason: the
   * gate reads it, and a stale copy still says onboarding is unfinished.
   */
  const completeThen = async (go: () => void) => {
    const profile = await finish();
    if (!profile) {
      toast.error("Couldn't finish setting up. Please try again.");
      return;
    }
    queryClient.setQueryData(profileKeys.me, profile);
    go();
  };

  const handleCreate = () =>
    completeThen(() => {
      // The modal store is global, so arming it here means the shell's
      // ModalProvider renders it already-open on arrival.
      onOpenModal("createServer");
      router.push(PAGE_ROUTES.HOME);
    });

  const handleJoin = () => {
    const code = parseInviteCode(inviteInput);
    if (!code) {
      toast.error("Paste an invite link or code first.");
      return;
    }
    return completeThen(() => router.push(`/invite/${code}`));
  };

  const handleDiscover = () =>
    completeThen(() => router.push(PAGE_ROUTES.DISCOVER));

  const handleSkip = () => completeThen(() => router.push(PAGE_ROUTES.HOME));

  const options = [
    {
      key: "create" as const,
      icon: Plus,
      title: "Create a server",
      body: "Start your own space and invite people in. You'll be the owner.",
    },
    {
      key: "join" as const,
      icon: Ticket,
      title: "I have an invite",
      body: "Paste an invite link or code from a friend.",
    },
    {
      key: "discover" as const,
      icon: Compass,
      title: "Browse public servers",
      body: "Explore communities open to anyone on Relaycat.",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-bold">Get into a server</h2>
        <p className="text-sm text-muted-foreground">
          Relaycat is better with people in it. Pick one — or skip and do it
          later.
        </p>
      </header>

      <div className="grid gap-3">
        {options.map(({ key, icon: Icon, title, body }) => (
          <button
            key={key}
            type="button"
            disabled={busy}
            onClick={() => setChoice(key)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition",
              "hover:border-brand/60 hover:bg-accent/50 disabled:opacity-60",
              choice === key && "border-brand bg-accent/50",
            )}
          >
            <span className="mt-0.5 rounded-lg bg-brand/10 p-2 text-brand">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-xs text-muted-foreground">{body}</span>
            </span>
          </button>
        ))}
      </div>

      {choice === "join" && (
        <div className="space-y-2">
          <Label htmlFor="invite">Invite link or code</Label>
          <Input
            id="invite"
            autoFocus
            placeholder="https://relaycat.app/invite/aB3xY9 — or just aB3xY9"
            disabled={busy}
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleJoin();
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center">
        <Button
          size="lg"
          disabled={busy || !choice}
          className="w-full sm:w-auto"
          onClick={() => {
            if (choice === "create") return void handleCreate();
            if (choice === "join") return void handleJoin();
            if (choice === "discover") return void handleDiscover();
          }}
        >
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {choice === "create" && "Create my server"}
          {choice === "join" && "Join server"}
          {choice === "discover" && "Browse servers"}
          {!choice && "Pick an option"}
        </Button>
        <Button
          variant="ghost"
          disabled={busy}
          className="w-full sm:w-auto"
          onClick={() => void handleSkip()}
        >
          I&apos;ll do this later
        </Button>
      </div>
    </div>
  );
};
