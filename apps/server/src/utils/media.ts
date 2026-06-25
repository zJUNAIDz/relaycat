import "dotenv/config";

/**
 * Public base URL where uploaded media is served from (e.g. an S3/CDN host).
 * We store only the object *path* in the DB and prepend this at response time,
 * so the host can change without rewriting stored data.
 */
function mediaBaseUrl(): string {
  return (process.env.MEDIA_BASE_URL ?? "").replace(/\/+$/, "");
}

const ABSOLUTE_URL = /^(https?:)?\/\//i;

/**
 * Normalise a value into a storable media path: strips any leading host so the
 * DB only ever holds a relative key. Pass-through for already-relative paths.
 */
export function toMediaPath(value?: string | null): string | null {
  if (!value) return value ?? null;
  if (!ABSOLUTE_URL.test(value)) return value.replace(/^\/+/, "");
  try {
    return new URL(value).pathname.replace(/^\/+/, "");
  } catch {
    return value;
  }
}

/**
 * Resolve a stored media path into a full URL using the runtime media host.
 * Leaves absolute URLs and empty values untouched.
 */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return path ?? null;
  if (ABSOLUTE_URL.test(path)) return path;
  const base = mediaBaseUrl();
  // Encode each segment so legacy keys containing spaces or other unsafe
  // characters resolve to a valid URL (e.g. "server-icons/My Server-uuid.jpeg").
  const encoded = path
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return base ? `${base}/${encoded}` : `/${encoded}`;
}

const MEDIA_KEYS = new Set(["image", "url", "banner", "avatar"]);

/**
 * Recursively walk an API payload and resolve any media-path fields to full
 * URLs. Returns a new object; the input is not mutated.
 */
export function withResolvedMedia<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => withResolvedMedia(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] =
        typeof val === "string" && MEDIA_KEYS.has(key)
          ? resolveMediaUrl(val)
          : withResolvedMedia(val);
    }
    return out as T;
  }
  return value;
}
