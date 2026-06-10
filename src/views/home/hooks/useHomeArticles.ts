import Articles_APIs from "@/services/api/articles";
import { parseArticlesListResponse } from "@/services/types/articles";
import { useQuery } from "@tanstack/react-query";

function useHomeArticles() {
  return useQuery({
    queryKey: ["articles", "home"],
    queryFn: async () => {
      const response = await Articles_APIs.getAll({ page: 1 });
      const result = parseArticlesListResponse(response.data);
      return result.articles.slice(0, 3);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export default useHomeArticles;
