import JournalistArticles_APIs from "@/services/api/journalist-articles";
import type { JournalistArticleStatus } from "@/types/journalist-article";
import { useQuery } from "@tanstack/react-query";

function useArchiveArticles(status?: JournalistArticleStatus | "all") {
  return useQuery({
    queryKey: ["journalist-articles", { status }],
    queryFn: async () => {
      const params = status && status !== "all" ? status : undefined;
      const response = await JournalistArticles_APIs.list(params);
      if (response.data.error) throw new Error(response.data.message);
      return response.data.data ?? [];
    },
    refetchOnWindowFocus: false,
  });
}

export default useArchiveArticles;
