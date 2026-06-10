import Discussion_APIs from "@/services/api/discussion";
import { parseDiscussionPostsResponse } from "@/services/types/discussion";
import { useQuery } from "@tanstack/react-query";

type UseDiscussionPostsOptions = {
  page?: number;
};

function useDiscussionPosts({ page = 1 }: UseDiscussionPostsOptions = {}) {
  return useQuery({
    queryKey: ["discussion-posts", page],
    queryFn: async () => {
      const response = await Discussion_APIs.list({ page });
      return parseDiscussionPostsResponse(response.data);
    },
    refetchOnWindowFocus: false,
  });
}

export default useDiscussionPosts;
