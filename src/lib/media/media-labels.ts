import type {
  ArticleStatus,
  PublicArticleMedia,
  PublicMediaType,
  StaffMediaType,
} from "@/types";
import { isSoundCloudPageUrl } from "./soundcloud-widget";
import {
  resolveMediaUrl,
  resolvePlayableVideoUrl,
  youtubeEmbedUrl,
} from "./media-url";
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

type PublicPlayableFields = Partial<PublicArticleMedia>;

/** Uploaded audio file from /media — not the external embed. */
export function publicArticleAudioUrl(
  media: PublicPlayableFields,
): string | null {
  const raw = media.source_audio;
  if (!raw?.trim()) return null;
  const resolved = resolveMediaUrl(raw) ?? raw.trim();
  return isPlayableAudioUrl(resolved) ? resolved : null;
}

/** TTS narration from /media — independent of the article's audio/video source. */
export function publicArticleNarrationUrl(
  media: PublicPlayableFields,
): string | null {
  const raw = media.generated_audio;
  if (!raw?.trim()) return null;
  const resolved = resolveMediaUrl(raw) ?? raw.trim();
  return isPlayableAudioUrl(resolved) ? resolved : null;
}

export type PublicArticleAudioSource =
  | { kind: "file"; url: string }
  | { kind: "soundcloud"; pageUrl: string }
  | { kind: "external"; pageUrl: string };

/**
 * Main audio source from GET /media.
 * `media_url` (embed) wins; otherwise the uploaded `source_audio`.
 * `generated_audio` is not mixed in here — check it separately.
 */
export function resolvePublicArticleAudioSource(
  media: PublicPlayableFields,
): PublicArticleAudioSource | null {
  const embed = media.media_url?.trim();
  if (embed) {
    if (isSoundCloudPageUrl(embed)) {
      return { kind: "soundcloud", pageUrl: embed };
    }
    const resolvedEmbed = resolveMediaUrl(embed) ?? embed;
    if (isPlayableAudioUrl(resolvedEmbed)) {
      return { kind: "file", url: resolvedEmbed };
    }
    if (/^https?:\/\//i.test(embed)) {
      return { kind: "external", pageUrl: embed };
    }
  }

  const fileUrl = publicArticleAudioUrl(media);
  if (fileUrl) {
    return { kind: "file", url: fileUrl };
  }

  return null;
}

export type PublicArticleVideoSource =
  | { kind: "file"; url: string }
  | { kind: "youtube"; embedUrl: string; pageUrl: string }
  | { kind: "external"; pageUrl: string };

/** Video/embed source from GET /media. `media_url` first, then uploaded `video`. */
export function resolvePublicArticleVideoSource(
  media: PublicPlayableFields,
  options?: {
    coverImage?: string | null;
    videoPoster?: string | null;
  },
): PublicArticleVideoSource | null {
  const embed = media.media_url?.trim();
  if (embed) {
    const youtube = youtubeEmbedUrl(embed);
    if (youtube) {
      return { kind: "youtube", embedUrl: youtube, pageUrl: embed };
    }
    if (/^https?:\/\//i.test(embed)) {
      return { kind: "external", pageUrl: embed };
    }
  }

  const fileUrl = resolvePlayableVideoUrl(media.video, {
    coverImage: options?.coverImage,
    videoPoster: options?.videoPoster,
  });
  if (fileUrl) {
    return { kind: "file", url: fileUrl };
  }

  return null;
}
