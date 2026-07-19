"use client";

import { Button } from "@/shared/components/ui/button";
import { Compass, MessageSquare, Users } from "lucide-react";
import { useOnboarding } from "../../use-onboarding";

const HIGHLIGHTS = [
  {
    icon: MessageSquare,
    title: "Talk in real time",
    body: "Channels, DMs, reactions and typing indicators — all live.",
  },
  {
    icon: Users,
    title: "Build your circle",
    body: "Add friends by username and see who's online at a glance.",
  },
  {
    icon: Compass,
    title: "Find communities",
    body: "Spin up your own server, or discover public ones to join.",
  },
];

export const WelcomeStep = ({ name }: { name: string }) => {
  const { next, busy } = useOnboarding();

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-3">
        <span className="text-5xl" role="img" aria-label="Waving cat">
          🐈
        </span>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome to Relaycat{name ? `, ${name}` : ""}!
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Let&apos;s set up your profile and get you into a community. This takes
          about a minute — you can change anything later.
        </p>
      </div>

      <ul className="grid gap-3 text-left sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-xl border bg-card/50 p-4">
            <Icon className="mb-2 h-5 w-5 text-brand" />
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>

      <Button size="lg" className="w-full sm:w-auto" disabled={busy} onClick={next}>
        Let&apos;s go
      </Button>
    </div>
  );
};
