import { errorToast, successToast } from "@/components/sonner-toast";
import Discussion_APIs from "@/services/api/discussion";
import {
  getDiscussionErrorMessage,
  parseDiscussionPostResponse,
} from "@/services/types/discussion";
import type { DiscussionPost } from "@/types/discussion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

function updatePostInCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  post: DiscussionPost,
) {
  queryClient.setQueriesData(
    { queryKey: ["discussion-posts"] },
    (current: { posts: DiscussionPost[]; meta: unknown } | undefined) => {
      if (!current) return current;
      return {
        ...current,
        posts: current.posts.map((item) => (item.id === post.id ? post : item)),
      };
    },
  );
}

function useJournalistPostFlag(postId: number) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const flagMutation = useMutation({
    mutationFn: async () => {
      const response = await Discussion_APIs.flagPost(postId);
      return parseDiscussionPostResponse(response.data);
    },
    onSuccess: (post) => {
      successToast(t("discussion.flagSuccess"));
      updatePostInCaches(queryClient, post);
    },
    onError: (error) => {
      errorToast(getDiscussionErrorMessage(error, t("discussion.flagError")));
    },
  });

  const unflagMutation = useMutation({
    mutationFn: async () => {
      const response = await Discussion_APIs.unflagPost(postId);
      return parseDiscussionPostResponse(response.data);
    },
    onSuccess: (post) => {
      successToast(t("discussion.unflagSuccess"));
      updatePostInCaches(queryClient, post);
    },
    onError: (error) => {
      errorToast(getDiscussionErrorMessage(error, t("discussion.unflagError")));
    },
  });

  return {
    flag: () => flagMutation.mutate(),
    unflag: () => unflagMutation.mutate(),
    isFlagging: flagMutation.isPending,
    isUnflagging: unflagMutation.isPending,
  };
}

export default useJournalistPostFlag;
