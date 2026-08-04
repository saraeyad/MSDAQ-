import type { ArticleStatus, PublicMediaType, StaffMediaType } from "@/types";
import { isSoundCloudPageUrl } from "@/lib/soundcloud-widget";
import { resolveMediaUrl } from "@/lib/media-url";
const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "مسودة",
  scheduled: "مجدول",
  published: "منشور",
  reverted: "مُرجَع",
};

const MEDIA_TYPE_LABELS: Record<StaffMediaType, string> = {
  text: "نص",
  audio: "صوت",
  video: "فيديو",
};

export function mediaTypeLabel(
  type: StaffMediaType | PublicMediaType | string,
): string {
  return MEDIA_TYPE_LABELS[type as StaffMediaType] ?? type;
}

export function publicMediaTypeLabel(type: PublicMediaType | string): string {
  return MEDIA_TYPE_LABELS[type as PublicMediaType] ?? type;
}

export function articleStatusLabel(status: ArticleStatus | string): string {
  return STATUS_LABELS[status as ArticleStatus] ?? status;
}

/** Whether the URL points at a file the browser can play in `<audio>`. */
export function isPlayableAudioUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;

  const trimmed = url.trim().toLowerCase();

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:audio")) {
    return true;
  }

  let pathname = trimmed;
  try {
    pathname = new URL(trimmed).pathname.toLowerCase();
  } catch {
    /* relative path */
  }

  if (pathname.includes("/storage/")) return true;

  return /\.(mp3|wav|ogg|m4a|aac|flac|webm|opus)(\?|$)/i.test(pathname);
}

/** Resolve playable audio URL from a public article payload. */
export function publicArticleAudioUrl(article: {
  source_audio?: string | null;
  generated_audio?: string | null;
  media_url?: string | null;
}): string | null {
  const candidates = [
    article.source_audio,
    article.generated_audio,
    article.media_url,
  ];

  for (const raw of candidates) {
    if (!raw?.trim()) continue;
    const resolved = resolveMediaUrl(raw) ?? raw.trim();
    if (isPlayableAudioUrl(resolved)) {
      return resolved;
    }
  }

  return null;
}

/** External stream/page URL when no direct audio file exists (e.g. SoundCloud). */
export function publicArticleExternalAudioUrl(article: {
  source_audio?: string | null;
  generated_audio?: string | null;
  media_url?: string | null;
}): string | null {
  if (publicArticleAudioUrl(article)) return null;

  const raw =
    article.media_url ?? article.source_audio ?? article.generated_audio ?? null;

  if (!raw?.trim()) return null;

  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;

  return trimmed;
}

export type PublicArticleAudioSource =
  | { kind: "file"; url: string }
  | { kind: "soundcloud"; pageUrl: string };

/** Direct MP3/file or SoundCloud (custom in-page player). */
export function resolvePublicArticleAudioSource(article: {
  source_audio?: string | null;
  generated_audio?: string | null;
  media_url?: string | null;
}): PublicArticleAudioSource | null {
  const fileUrl = publicArticleAudioUrl(article);
  if (fileUrl) {
    return { kind: "file", url: fileUrl };
  }

  const externalUrl = publicArticleExternalAudioUrl(article);
  if (externalUrl && isSoundCloudPageUrl(externalUrl)) {
    return { kind: "soundcloud", pageUrl: externalUrl };
  }

  return null;
}
