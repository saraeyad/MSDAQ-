import { errorToast } from "@/components/sonner-toast";
import SmartEditor_APIs, {
  type SmartEditorResultData,
  type SmartEditorTool,
} from "@/services/api/smart-editor";
import { getApiErrorMessage } from "@/services/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function useSmartEditor() {
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: async ({
      tool,
      text,
    }: {
      tool: SmartEditorTool;
      text: string;
    }) => {
      const response = await SmartEditor_APIs.run(tool, text);
      if (response.data.error || !response.data.data) {
        throw new Error(
          response.data.message || t("journalist.smartEditor.errorRetry"),
        );
      }
      return {
        tool,
        data: response.data.data,
      };
    },
    onError: (error) => {
      errorToast(
        getApiErrorMessage(error, t("journalist.smartEditor.errorRetry")),
      );
    },
  });

  return {
    run: mutation.mutate,
    isRunning: mutation.isPending,
    result: mutation.data ?? null,
    activeTool: mutation.variables?.tool ?? null,
    reset: mutation.reset,
  };
}

export type SmartEditorMutationResult = {
  tool: SmartEditorTool;
  data: SmartEditorResultData;
} | null;
