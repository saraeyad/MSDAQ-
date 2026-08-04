import { derivePublishGate } from "@/lib/publish-gate";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useQuery } from "@tanstack/react-query";

export function usePublishGate(articleId: number | string | undefined) {
  const query = useQuery({
    queryKey: ["staff-article", articleId],
    queryFn: () => ArticlesStaff_APIs.getArticle(articleId!),
    enabled: !!articleId,
    refetchInterval: 30_000,
  });

  const gate = query.data ? derivePublishGate(query.data) : undefined;

  return {
    ...query,
    data: gate,
    article: query.data,
  };
}
