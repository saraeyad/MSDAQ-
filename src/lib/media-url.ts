import { apiOrigin } from "@/lib/api-origin";

/** Resolve media URLs for `<img src>` — proxy path in dev, absolute in production. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;

  const trimmed = url.trim();

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // When calling the API directly (VITE_HOST_API), keep absolute storage URLs.
    if (import.meta.env.DEV && !import.meta.env.VITE_HOST_API) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.pathname.startsWith("/storage")) {
          return `${parsed.pathname}${parsed.search}`;
        }
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_HOST_API ? `${apiOrigin()}${path}` : path;
  }

  return `${apiOrigin()}${path}`;
}

/**
 * Absolute URL for server-side tools (reverse search, AI detect via URL).
 * Not shown in the UI — used only for API calls.
 */
export function absoluteMediaUrlForApi(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;

  const trimmed = url.trim();

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const withStorage =
    trimmed.startsWith("storage/") || trimmed.startsWith("/storage")
      ? trimmed
      : looksLikeRelativeDiskPath(trimmed)
        ? `storage/${trimmed.replace(/^\/+/, "")}`
        : trimmed;

  const path = withStorage.startsWith("/") ? withStorage : `/${withStorage}`;
  return `${apiOrigin()}${path}`;
}

const MEDIA_URL_KEYS = [
  "file_url",
  "fileUrl",
  "public_url",
  "publicUrl",
  "full_url",
  "fullUrl",
  "cover_url",
  "coverUrl",
  "image_url",
  "imageUrl",
  "media_url",
  "mediaUrl",
  "url",
  "path",
  "file_path",
  "filePath",
  "storage_path",
  "storagePath",
  "file",
] as const;

function looksLikeRelativeDiskPath(value: string): boolean {
  if (value.startsWith("/") || value.startsWith("http")) return false;
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(value) ||
    value.includes("/");
}

function looksLikePublicMediaPath(value: string): boolean {
  if (!value.trim()) return false;
  if (/^https?:\/\//i.test(value)) return !value.includes("/api/library/");
  if (value.includes("/api/")) return false;
  return (
    value.includes("storage") ||
    /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(value)
  );
}

/** Pull a public https media URL out of a library/cover upload payload. */
export function extractPublicMediaUrl(payload: unknown, depth = 0): string | null {
  if (depth > 3 || payload == null) return null;

  if (typeof payload === "string") {
    return looksLikePublicMediaPath(payload)
      ? absoluteMediaUrlForApi(payload)
      : null;
  }

  if (typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  for (const key of MEDIA_URL_KEYS) {
    const value = record[key];
    if (typeof value === "string" && looksLikePublicMediaPath(value)) {
      return absoluteMediaUrlForApi(value);
    }
    if (value && typeof value === "object") {
      const nested = extractPublicMediaUrl(value, depth + 1);
      if (nested) return nested;
    }
  }

  for (const nestedKey of ["data", "item", "media", "image"]) {
    if (record[nestedKey]) {
      const nested = extractPublicMediaUrl(record[nestedKey], depth + 1);
      if (nested) return nested;
    }
  }

  return null;
}

/** Best cover image for a public article (cover field, then first gallery image). */
export function publicArticleCoverUrl(article: {
  cover_image?: string | null;
  images?: { thumb?: string; full?: string }[];
}): string | null {
  const cover = resolveMediaUrl(article.cover_image);
  if (cover) return cover;

  const first = article.images?.[0];
  return resolveMediaUrl(first?.full ?? first?.thumb ?? null);
}
