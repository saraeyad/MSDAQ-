import type { ArticleMedia } from "@/types";

export function normalizeArticleMedia(
  data: Partial<ArticleMedia> | null | undefined,
): ArticleMedia {
  return {
    media_url: data?.media_url ?? null,
    source_audio: data?.source_audio ?? null,
    generated_audio: data?.generated_audio ?? null,
    video: data?.video ?? null,
  };
}

export function mergeArticleMedia<T extends object>(
  article: T,
  media?: Partial<ArticleMedia> | null,
): T & ArticleMedia {
  return { ...article, ...normalizeArticleMedia(media) };
}
