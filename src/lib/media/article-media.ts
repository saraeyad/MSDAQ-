import type { ArticleMedia } from "@/types";

export function normalizeArticleMedia(
  data: Partial<ArticleMedia> | null | undefined,
): ArticleMedia {
  const next: ArticleMedia = {
    media_url: data?.media_url ?? null,
    source_audio: data?.source_audio ?? null,
    generated_audio: data?.generated_audio ?? null,
    video: data?.video ?? null,
  };
  if (data?.cover_image) next.cover_image = data.cover_image;
  if (data?.cover_thumb) next.cover_thumb = data.cover_thumb;
  if (data?.cover_description) next.cover_description = data.cover_description;
  if (data?.images?.length) next.images = data.images;
  return next;
}

function filledMediaValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function preferMediaValue(
  fromMedia: string | null | undefined,
  fromArticle: string | null | undefined,
): string | null {
  return filledMediaValue(fromMedia) ?? filledMediaValue(fromArticle);
}

/**
 * Show responses sometimes omit `media_url` (it lives on GET /media).
 * Keep a link we already saved instead of treating a missing field as cleared.
 */
export function retainOmittedMediaUrl<T extends { media_url?: string | null }>(
  fresh: T,
  previous?: { media_url?: string | null } | null,
): T {
  if (fresh.media_url !== undefined) return fresh;
  const saved = previous?.media_url?.trim();
  if (!saved) return fresh;
  return { ...fresh, media_url: saved };
}

export function mergeArticleMedia<T extends object>(
  article: T,
  media?: Partial<ArticleMedia> | null,
): T & ArticleMedia {
  const record = article as T & Partial<ArticleMedia>;
  if (!media) {
    return {
      ...article,
      media_url: filledMediaValue(record.media_url),
      source_audio: filledMediaValue(record.source_audio),
      generated_audio: filledMediaValue(record.generated_audio),
      video: filledMediaValue(record.video),
    };
  }

  const normalized = normalizeArticleMedia(media);
  return {
    ...article,
    ...normalized,
    media_url: preferMediaValue(normalized.media_url, record.media_url),
    source_audio: preferMediaValue(normalized.source_audio, record.source_audio),
    generated_audio: preferMediaValue(
      normalized.generated_audio,
      record.generated_audio,
    ),
    video: preferMediaValue(normalized.video, record.video),
  };
}
