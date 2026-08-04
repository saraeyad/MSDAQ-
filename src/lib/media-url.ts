const DEFAULT_API_URL = "https://misdaq-production-1ff3.up.railway.app";

function apiOrigin(): string {
  const base = import.meta.env.VITE_HOST_API || DEFAULT_API_URL;
  try {
    return new URL(base).origin;
  } catch {
    return DEFAULT_API_URL;
  }
}

/** Resolve media URLs for `<img src>` — proxy path in dev, absolute in production. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;

  const trimmed = url.trim();

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (import.meta.env.DEV) {
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
    return path;
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

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${apiOrigin()}${path}`;
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
