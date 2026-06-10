import { errorToast, successToast } from "@/components/sonner-toast";
import JournalistArticles_APIs from "@/services/api/journalist-articles";
import { getApiErrorMessage } from "@/services/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

function useAdminArticleActions(id: number | string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => JournalistArticles_APIs.adminReview(id, "approve"),
    onSuccess: (response) => {
      if (response.data.error) {
        errorToast(response.data.message);
        return;
      }
      successToast(t("admin.articleReview.approveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["admin-pending-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article", id] });
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("admin.articleReview.approveError")));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (rejectionReason?: string) =>
      JournalistArticles_APIs.adminReview(id, "reject", rejectionReason),
    onSuccess: (response, _vars, context) => {
      if (response.data.error) {
        errorToast(response.data.message);
        return;
      }
      successToast(t("admin.articleReview.rejectSuccess"));
      queryClient.invalidateQueries({ queryKey: ["admin-pending-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article", id] });
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("admin.articleReview.rejectError")));
    },
  });

  return {
    approve: approveMutation.mutate,
    reject: (
      rejectionReason?: string,
      options?: { onSuccess?: () => void }
    ) => {
      rejectMutation.mutate(rejectionReason, {
        onSuccess: (response) => {
          if (response.data.error) return;
          options?.onSuccess?.();
        },
      });
    },
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}

export default useAdminArticleActions;
