"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useOnboarding } from "../../use-onboarding";

const BIO_MAX = 500;

export const AboutStep = () => {
  const { draft, setField, busy } = useOnboarding();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-bold">Tell people about you</h2>
        <p className="text-sm text-muted-foreground">
          All optional — it just makes your profile card feel less empty.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pronouns">Pronouns</Label>
          <Input
            id="pronouns"
            placeholder="they/them"
            disabled={busy}
            value={draft.pronouns}
            onChange={(e) => setField("pronouns", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Custom status</Label>
          <Input
            id="status"
            placeholder="Building cool stuff ✨"
            disabled={busy}
            value={draft.status}
            onChange={(e) => setField("status", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">About me</Label>
          <span className="text-xs text-muted-foreground">
            {draft.bio.length}/{BIO_MAX}
          </span>
        </div>
        <Textarea
          id="bio"
          rows={4}
          maxLength={BIO_MAX}
          placeholder="Tell people a little about yourself…"
          disabled={busy}
          value={draft.bio}
          onChange={(e) => setField("bio", e.target.value)}
        />
      </div>
    </div>
  );
};
