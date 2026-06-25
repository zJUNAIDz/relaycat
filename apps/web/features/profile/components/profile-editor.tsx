"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";
import { useS3Uploads } from "@/features/server/hooks/use-s3-uploads";
import type { ProfileLink, UpdateProfileInput } from "@repo/types";
import { Loader2, Palette, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useMyProfile,
  useUpdateProfileMutation,
} from "../hooks/profile-mutations";
import { ProfileImageField } from "./profile-image-field";
import { ProfilePreview } from "./profile-preview";

const ACCENT_SWATCHES = [
  "#5865F2",
  "#EB459E",
  "#ED4245",
  "#FEE75C",
  "#57F287",
  "#3BA55D",
  "#FAA61A",
  "#9B59B6",
];

const FALLBACK_ACCENT = "#5865F2";

interface FormValues {
  username: string;
  displayName: string;
  bio: string;
  pronouns: string;
  status: string;
  accentColor: string;
  links: ProfileLink[];
}

interface ImageState {
  preview: string | null;
  file: File | null;
  dirty: boolean;
}

const emptyImage: ImageState = { preview: null, file: null, dirty: false };

const orNull = (v: string) => {
  const t = v.trim();
  return t.length ? t : null;
};

export const ProfileEditor = () => {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfileMutation();
  const { uploadProfileAvatar, uploadProfileBanner, isUploading } =
    useS3Uploads();

  const [avatar, setAvatar] = useState<ImageState>(emptyImage);
  const [banner, setBanner] = useState<ImageState>(emptyImage);

  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
      pronouns: "",
      status: "",
      accentColor: FALLBACK_ACCENT,
      links: [],
    },
  });
  const { register, control, handleSubmit, reset, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  // Hydrate the form once the profile loads.
  useEffect(() => {
    if (!profile) return;
    reset({
      username: profile.username ?? "",
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      pronouns: profile.pronouns ?? "",
      status: profile.status ?? "",
      accentColor: profile.accentColor ?? FALLBACK_ACCENT,
      links: profile.links ?? [],
    });
    setAvatar({ preview: profile.avatar ?? null, file: null, dirty: false });
    setBanner({ preview: profile.banner ?? null, file: null, dirty: false });
  }, [profile, reset]);

  const values = watch();
  const isSaving = updateProfile.isPending || isUploading;

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: UpdateProfileInput = {
        // Normalise to the server's username rules (lowercase handle).
        username: data.username.trim()
          ? data.username.trim().toLowerCase()
          : null,
        displayName: orNull(data.displayName),
        bio: orNull(data.bio),
        pronouns: orNull(data.pronouns),
        status: orNull(data.status),
        accentColor: orNull(data.accentColor),
        links: data.links.filter((l) => l.label.trim() && l.url.trim()),
      };

      if (avatar.dirty) {
        payload.avatar = avatar.file
          ? await uploadProfileAvatar(avatar.file, data.displayName)
          : null;
      }
      if (banner.dirty) {
        payload.banner = banner.file
          ? await uploadProfileBanner(banner.file, data.displayName)
          : null;
      }

      await updateProfile.mutateAsync(payload);
      toast.success("Profile saved");
      // Clear dirty flags; resolved URLs come back from the query refetch.
      setAvatar((s) => ({ ...s, file: null, dirty: false }));
      setBanner((s) => ({ ...s, file: null, dirty: false }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save profile",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const authName = profile?.user?.name ?? "user";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
    >
      {/* ---- Form column ---- */}
      <div className="space-y-8">
        {/* Images */}
        <section className="space-y-4">
          <ProfileImageField
            variant="banner"
            value={banner.preview}
            accentColor={values.accentColor}
            disabled={isSaving}
            onSelect={(file, url) =>
              setBanner({ preview: url, file, dirty: true })
            }
            onClear={() => setBanner({ preview: null, file: null, dirty: true })}
          />
          <div className="flex items-center gap-4">
            <ProfileImageField
              variant="avatar"
              value={avatar.preview}
              accentColor={values.accentColor}
              disabled={isSaving}
              onSelect={(file, url) =>
                setAvatar({ preview: url, file, dirty: true })
              }
              onClear={() =>
                setAvatar({ preview: null, file: null, dirty: true })
              }
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF or WebP. Avatar up to 5MB, banner up to 8MB.
            </p>
          </div>
        </section>

        <Separator />

        {/* Identity */}
        <section className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="your_handle"
              disabled={isSaving}
              {...register("username")}
            />
            <p className="text-xs text-muted-foreground">
              Your unique handle (lowercase letters, numbers, dot or
              underscore). Friends find you by this.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              placeholder={authName}
              disabled={isSaving}
              {...register("displayName")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pronouns">Pronouns</Label>
              <Input
                id="pronouns"
                placeholder="they/them"
                disabled={isSaving}
                {...register("pronouns")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Custom status</Label>
              <Input
                id="status"
                placeholder="Building cool stuff ✨"
                disabled={isSaving}
                {...register("status")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About me</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell people a little about yourself…"
              disabled={isSaving}
              {...register("bio")}
            />
          </div>
        </section>

        <Separator />

        {/* Accent color */}
        <section className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Accent color
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                disabled={isSaving}
                onClick={() => setValue("accentColor", c, { shouldDirty: true })}
                className="h-8 w-8 rounded-full ring-offset-2 transition hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline:
                    values.accentColor?.toLowerCase() === c.toLowerCase()
                      ? `2px solid ${c}`
                      : "none",
                }}
              />
            ))}
            <input
              type="color"
              aria-label="Custom accent color"
              disabled={isSaving}
              value={values.accentColor || FALLBACK_ACCENT}
              onChange={(e) =>
                setValue("accentColor", e.target.value, { shouldDirty: true })
              }
              className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
            />
          </div>
        </section>

        <Separator />

        {/* Links */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Links</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving || fields.length >= 5}
              onClick={() => append({ label: "", url: "" })}
            >
              <Plus className="mr-1 h-4 w-4" /> Add link
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add up to 5 links (website, GitHub, socials…).
            </p>
          )}
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder="Label"
                  className="w-1/3"
                  disabled={isSaving}
                  {...register(`links.${i}.label` as const)}
                />
                <Input
                  placeholder="https://…"
                  disabled={isSaving}
                  {...register(`links.${i}.url` as const)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isSaving}
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/channels/me">Cancel</Link>
          </Button>
        </div>
      </div>

      {/* ---- Live preview column ---- */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
          Preview
        </p>
        <ProfilePreview
          displayName={values.displayName}
          username={values.username || authName}
          bio={values.bio}
          pronouns={values.pronouns}
          status={values.status}
          accentColor={values.accentColor}
          avatarUrl={avatar.preview}
          bannerUrl={banner.preview}
          links={values.links}
        />
      </div>
    </form>
  );
};
