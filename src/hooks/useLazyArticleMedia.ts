import { Articles_APIs } from "@/services/api/articles";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export type ArticleMediaScope = "public" | "staff";

function articleMediaQueryKey(
  scope: ArticleMediaScope,
  articleId: number | string,
) {
  return [scope, "article-media", String(articleId)] as const;
}

function fetchArticleMedia(scope: ArticleMediaScope, articleId: number | string) {
  return scope === "staff"
    ? ArticlesStaff_APIs.getMedia(articleId)
    : Articles_APIs.getMedia(articleId);
}

/** Fetches playable sources only after `request()` — i.e. the play click. */
export function useLazyArticleMedia(
  articleId: number | string,
  scope: ArticleMediaScope = "public",
) {
  const [requested, setRequested] = useState(false);

  const query = useQuery({
    queryKey: articleMediaQueryKey(scope, articleId),
    queryFn: () => fetchArticleMedia(scope, articleId),
    enabled: requested,
    staleTime: Infinity,
    retry: 1,
  });

  const request = useCallback(() => {
    setRequested(true);
  }, []);

  return {
    media: query.data ?? null,
    isLoading: requested && (query.isLoading || query.isFetching),
    isError: query.isError,
    request,
    requested,
  };
}

/** Staff editor / publish gate — merge into the article, not for public page load. */
export function useStaffArticleMedia(
  articleId: number | string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: articleMediaQueryKey("staff", articleId ?? ""),
    queryFn: () => ArticlesStaff_APIs.getMedia(articleId!),
    enabled: Boolean(articleId) && enabled,
    staleTime: 30_000,
  });
}
