import Articles_APIs from "@/services/api/articles";
import { parseArticlesListResponse } from "@/services/types/articles";
import { useQuery } from "@tanstack/react-query";

type UseArticlesListOptions = {
  page?: number;
  search?: string;
};

function useArticlesList({ page = 1, search = "" }: UseArticlesListOptions = {}) {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: ["articles", page, normalizedSearch],
    queryFn: async () => {
      const response = await Articles_APIs.getAll({
        page,
        search: normalizedSearch || undefined,
      });
      return parseArticlesListResponse(response.data);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export default useArticlesList;
