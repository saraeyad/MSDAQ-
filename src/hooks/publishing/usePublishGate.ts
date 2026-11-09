import { useStaffArticleMedia } from "@/hooks/useLazyArticleMedia";
import { mergeArticleMedia, retainOmittedMediaUrl } from "@/lib/media";
import { derivePublishGate } from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function usePublishGate(
  articleId: number | string | undefined,
  options?: { loadMedia?: boolean },
) {
  const loadMedia = options?.loadMedia ?? false;
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["staff-article", articleId],
    queryFn: async () => {
      const fresh = await ArticlesStaff_APIs.getArticle(articleId!);
      const previous = queryClient.getQueryData<typeof fresh>([
        "staff-article",
        articleId,
      ]);
      return retainOmittedMediaUrl(fresh, previous);
    },
    enabled: !!articleId,
    refetchInterval: 30_000,
  });
  const mediaQuery = useStaffArticleMedia(articleId, !!articleId && loadMedia);
  const article = query.data
    ? mergeArticleMedia(query.data, mediaQuery.data)
    : query.data;

  const gate = article ? derivePublishGate(article) : undefined;

  return {
    ...query,
    isLoading: query.isLoading || mediaQuery.isLoading,
    data: gate,
    article,
  };
}
