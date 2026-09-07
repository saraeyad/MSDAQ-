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

const IMAGE_EXTENSION = /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?.*)?$/i;
const VIDEO_EXTENSION =
  /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv|m3u8?|mpd)(\?.*)?$/i;
const EMBED_HOST =
  /(?:youtube\.com|youtu\.be|vimeo\.com|soundcloud\.com|dailymotion\.com)/i;

function youtubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const fromQuery = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (fromQuery?.[1]) return fromQuery[1];

  const fromShort = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed|shorts|live|v)\/)([a-zA-Z0-9_-]{11})/i,
  );
  if (fromShort?.[1]) return fromShort[1];

  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const isYoutube = host === "youtu.be" || host.endsWith("youtube.com");
    if (!isYoutube) return null;

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : id || null;
    }

    const fromParam = parsed.searchParams.get("v");
    if (fromParam) return fromParam;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) =>
      ["embed", "shorts", "live", "v"].includes(part),
    );
    if (marker >= 0 && parts[marker + 1]) return parts[marker + 1];
  } catch {
    return null;
  }

  return null;
}

/** YouTube watch/share URL → embeddable iframe src, or null. */
export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const id = youtubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

function normalizeMediaPath(url: string): string {
  try {
    const parsed = new URL(url, "http://local");
    return parsed.pathname.toLowerCase();
  } catch {
    return url.toLowerCase().split("?")[0] ?? url.toLowerCase();
  }
}

/** True when the URL points at an image, not a video file. */
export function isImageMediaUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("data:image")) return true;
  return IMAGE_EXTENSION.test(trimmed);
}

export interface PlayableVideoOptions {
  /** Raw or resolved URLs that must not be treated as video (cover, poster, etc.). */
  rejectUrls?: Array<string | null | undefined>;
}

/**
 * Whether a URL is safe to pass to `<video src>`.
 * Rejects image paths, embed pages, and URLs that match cover/poster fields.
 */
export function isPlayableVideoUrl(
  url: string | null | undefined,
  options?: PlayableVideoOptions,
): boolean {
  if (!url?.trim()) return false;
  const trimmed = url.trim();

  if (trimmed.startsWith("blob:")) return true;
  if (isImageMediaUrl(trimmed)) return false;
  if (EMBED_HOST.test(trimmed)) return false;

  const path = normalizeMediaPath(trimmed);
  for (const reject of options?.rejectUrls ?? []) {
    if (!reject?.trim()) continue;
    const resolvedReject = resolveMediaUrl(reject);
    if (resolvedReject && normalizeMediaPath(resolvedReject) === path) {
      return false;
    }
    if (normalizeMediaPath(reject) === path) return false;
  }

  if (VIDEO_EXTENSION.test(trimmed)) return true;
  if (/\/videos?\//i.test(trimmed) && !/\/cover/i.test(trimmed)) return true;

  return false;
}

/** Resolve and validate a stored video URL for HTML5 playback. */
export function resolvePlayableVideoUrl(
  videoUrl: string | null | undefined,
  options?: PlayableVideoOptions & {
    coverImage?: string | null;
    videoPoster?: string | null;
  },
): string | null {
  const resolved = resolveMediaUrl(videoUrl);
  if (!resolved) return null;

  const rejectUrls = [
    ...(options?.rejectUrls ?? []),
    videoUrl,
    options?.coverImage,
    options?.videoPoster,
  ];

  if (!isPlayableVideoUrl(resolved, { rejectUrls })) return null;
  return resolved;
}
