"use client";

import { ProfileImageField } from "@/features/profile/components/profile-image-field";
import { ACCENT_SWATCHES, FALLBACK_ACCENT } from "@/features/profile/accent-colors";
import { Label } from "@/shared/components/ui/label";
import { Palette } from "lucide-react";
import { useOnboarding } from "../../use-onboarding";

export const AppearanceStep = () => {
  const { draft, avatar, banner, setField, setImage, busy } = useOnboarding();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-bold">Make it yours</h2>
        <p className="text-sm text-muted-foreground">
          A picture and a colour go a long way. Skip it and we&apos;ll give you a
          default.
        </p>
      </header>

      <div className="space-y-4">
        <ProfileImageField
          variant="banner"
          value={banner.preview}
          accentColor={draft.accentColor}
          disabled={busy}
          onSelect={(file) => setImage("banner", file)}
          onClear={() => setImage("banner", null)}
        />
        <div className="flex items-center gap-4">
          <ProfileImageField
            variant="avatar"
            value={avatar.preview}
            accentColor={draft.accentColor}
            disabled={busy}
            onSelect={(file) => setImage("avatar", file)}
            onClear={() => setImage("avatar", null)}
          />
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF or WebP. Avatar up to 5MB, banner up to 8MB.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Palette className="h-4 w-4" /> Accent colour
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              aria-label={`Accent ${c}`}
              disabled={busy}
              onClick={() => setField("accentColor", c)}
              className="h-8 w-8 rounded-full ring-offset-2 transition hover:scale-110"
              style={{
                backgroundColor: c,
                outline:
                  draft.accentColor?.toLowerCase() === c.toLowerCase()
                    ? `2px solid ${c}`
                    : "none",
              }}
            />
          ))}
          <input
            type="color"
            aria-label="Custom accent colour"
            disabled={busy}
            value={draft.accentColor || FALLBACK_ACCENT}
            onChange={(e) => setField("accentColor", e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
          />
        </div>
      </div>
    </div>
  );
};
