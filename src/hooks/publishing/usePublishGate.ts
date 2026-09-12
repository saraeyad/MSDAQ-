import { useStaffArticleMedia } from "@/hooks/useLazyArticleMedia";
import { mergeArticleMedia } from "@/lib/media";
import { derivePublishGate } from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useQuery } from "@tanstack/react-query";

export function usePublishGate(articleId: number | string | undefined) {
  const query = useQuery({
    queryKey: ["staff-article", articleId],
    queryFn: () => ArticlesStaff_APIs.getArticle(articleId!),
    enabled: !!articleId,
    refetchInterval: 30_000,
  });
  const mediaQuery = useStaffArticleMedia(articleId, !!articleId);
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
