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

export function mergeArticleMedia<T extends object>(
  article: T,
  media?: Partial<ArticleMedia> | null,
): T & ArticleMedia {
  return { ...article, ...normalizeArticleMedia(media) };
}
