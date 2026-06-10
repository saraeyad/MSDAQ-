import { errorToast, successToast } from "@/components/sonner-toast";
import AdminJournalistRequests_APIs from "@/services/api/admin-journalist-requests";
import { parseJournalistRequestActionResponse } from "@/services/types/admin-journalist-requests";
import { getApiErrorMessage } from "@/services/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

function useJournalistRequestActions(id: number | string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await AdminJournalistRequests_APIs.approve(id);
      parseJournalistRequestActionResponse(response.data);
    },
    onSuccess: () => {
      successToast(t("admin.approveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["journalist-requests"] });
      queryClient.invalidateQueries({ queryKey: ["journalist-request", id] });
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("admin.approveError")));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (rejection_reason?: string) => {
      const response = await AdminJournalistRequests_APIs.reject(id, {
        rejection_reason,
      });
      parseJournalistRequestActionResponse(response.data);
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("admin.rejectError")));
    },
  });

  return {
    approve: (options?: { onSuccess?: () => void }) => {
      approveMutation.mutate(undefined, {
        onSuccess: () => options?.onSuccess?.(),
      });
    },
    reject: (rejection_reason?: string, options?: { onSuccess?: () => void }) => {
      rejectMutation.mutate(rejection_reason, {
        onSuccess: () => {
          successToast(t("admin.rejectSuccess"));
          queryClient.invalidateQueries({ queryKey: ["journalist-requests"] });
          queryClient.invalidateQueries({ queryKey: ["journalist-request", id] });
          options?.onSuccess?.();
        },
      });
    },
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}

export default useJournalistRequestActions;
