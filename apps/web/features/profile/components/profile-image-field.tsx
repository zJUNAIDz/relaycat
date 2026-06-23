"use client";

import { cn } from "@/shared/utils/cn";
import { Camera, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface ProfileImageFieldProps {
  variant: "avatar" | "banner";
  /** Resolved URL (existing) or object URL (freshly picked); null = empty. */
  value: string | null;
  onSelect: (file: File, objectUrl: string) => void;
  onClear: () => void;
  disabled?: boolean;
  /** Used to tint the empty banner / avatar ring. */
  accentColor?: string;
  className?: string;
}

const ACCEPT = "image/png,image/jpeg,image/jpg,image/gif,image/webp";

/**
 * Click-to-upload image field with an inline preview. Reports the chosen File
 * and a local object URL to the parent; the actual S3 upload happens on submit.
 */
export const ProfileImageField = ({
  variant,
  value,
  onSelect,
  onClear,
  disabled,
  accentColor,
  className,
}: ProfileImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isAvatar = variant === "avatar";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSelect(file, URL.createObjectURL(file));
    // Allow re-picking the same file.
    e.target.value = "";
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        style={
          !value && accentColor
            ? { background: `${accentColor}26` }
            : undefined
        }
        className={cn(
          "group relative flex items-center justify-center overflow-hidden border border-dashed border-neutral-300 bg-muted/40 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700",
          isAvatar
            ? "h-24 w-24 rounded-full"
            : "h-32 w-full rounded-xl md:h-40",
        )}
      >
        {value ? (
          <Image
            src={value}
            alt={variant}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            {isAvatar ? <Camera className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            {isAvatar ? "Avatar" : "Upload banner"}
          </span>
        )}
        <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
          <Camera className="h-5 w-5" />
        </span>
      </button>
      {value && (
        <button
          type="button"
          title={`Remove ${variant}`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className={cn(
            "absolute z-10 rounded-full bg-rose-500 p-1 text-white shadow disabled:opacity-60",
            isAvatar ? "right-0 top-0" : "right-2 top-2",
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
