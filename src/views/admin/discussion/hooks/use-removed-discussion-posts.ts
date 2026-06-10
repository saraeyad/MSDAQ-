import AdminDiscussion_APIs from "@/services/api/admin-discussion";
import { parseRemovedDiscussionPostsResponse } from "@/services/types/admin-discussion";
import { useQuery } from "@tanstack/react-query";

type UseRemovedDiscussionPostsOptions = {
  page?: number;
};

function useRemovedDiscussionPosts({ page = 1 }: UseRemovedDiscussionPostsOptions = {}) {
  return useQuery({
    queryKey: ["admin-removed-discussion-posts", page],
    queryFn: async () => {
      const response = await AdminDiscussion_APIs.listRemoved({ page });
      return parseRemovedDiscussionPostsResponse(response.data);
    },
    refetchOnWindowFocus: false,
  });
}

export default useRemovedDiscussionPosts;
