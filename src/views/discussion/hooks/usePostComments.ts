import Discussion_APIs from "@/services/api/discussion";
import { parseDiscussionCommentsResponse } from "@/services/types/discussion";
import { useQuery } from "@tanstack/react-query";

function usePostComments(postId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["discussion-comments", postId],
    enabled,
    queryFn: async () => {
      const response = await Discussion_APIs.listComments(postId);
      return parseDiscussionCommentsResponse(response.data);
    },
    refetchOnWindowFocus: false,
  });
}

export default usePostComments;
