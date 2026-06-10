import Articles_APIs from "@/services/api/articles";
import { parseArticleDetailResponse } from "@/services/types/articles";
import { useQuery } from "@tanstack/react-query";

function useArticleDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["article", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await Articles_APIs.getById(id!);
      return parseArticleDetailResponse(response.data);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export default useArticleDetail;
