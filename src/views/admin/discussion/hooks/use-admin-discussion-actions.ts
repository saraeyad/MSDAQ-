import { errorToast, successToast } from "@/components/sonner-toast";
import AdminDiscussion_APIs from "@/services/api/admin-discussion";
import {
  parseAdminDiscussionActionResponse,
  parseAdminDiscussionRestoreResponse,
} from "@/services/types/admin-discussion";
import { getApiErrorMessage } from "@/services/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

function useAdminDiscussionActions() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin-removed-discussion-posts"],
    });
    queryClient.invalidateQueries({ queryKey: ["discussion-posts"] });
  };

  const removeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await AdminDiscussion_APIs.removePost(postId);
      parseAdminDiscussionActionResponse(response.data);
      return postId;
    },
    onSuccess: (postId) => {
      successToast(t("admin.discussion.removeSuccess"));
      queryClient.setQueriesData(
        { queryKey: ["discussion-posts"] },
        (
          current:
            | { posts: { id: number }[]; meta: { total: number } }
            | undefined,
        ) => {
          if (!current) return current;
          return {
            ...current,
            posts: current.posts.filter((post) => post.id !== postId),
            meta: {
              ...current.meta,
              total: Math.max(current.meta.total - 1, 0),
            },
          };
        },
      );
      invalidate();
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("admin.discussion.removeError")));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await AdminDiscussion_APIs.restorePost(postId);
      return parseAdminDiscussionRestoreResponse(response.data);
    },
    onSuccess: () => {
      successToast(t("admin.discussion.restoreSuccess"));
      invalidate();
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("admin.discussion.restoreError")));
    },
  });

  return {
    removePost: removeMutation.mutate,
    restorePost: restoreMutation.mutate,
    isRemoving: removeMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

export default useAdminDiscussionActions;
