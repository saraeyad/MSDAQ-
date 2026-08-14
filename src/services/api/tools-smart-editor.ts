import { getApiData } from "@/lib/api-data";
import type {
  ApiResponse,
  EditorialDetectResult,
  EditorialRewriteSpan,
  SmartEditorResult,
} from "@/types";
import API from "./api.repository";

export const SmartEditor_APIs = {
  fushaRewriter: async (text: string): Promise<SmartEditorResult> => {
    const response = await API.post<ApiResponse<{ suggestion: string }>>(
      "/api/tools/fusha-rewriter",
      { text },
    );
    return getApiData(response);
  },

  biasNeutralizer: {
    detect: async (text: string): Promise<EditorialDetectResult> => {
      const response = await API.post<ApiResponse<EditorialDetectResult>>(
        "/api/tools/bias-neutralizer/detect",
        { text },
      );
      return getApiData(response);
    },
    rewrite: async (
      text: string,
      spans: EditorialRewriteSpan[],
    ): Promise<SmartEditorResult> => {
      const response = await API.post<ApiResponse<{ suggestion: string }>>(
        "/api/tools/bias-neutralizer/rewrite",
        { text, spans },
      );
      return getApiData(response);
    },
  },

  discriminationRemover: {
    detect: async (text: string): Promise<EditorialDetectResult> => {
      const response = await API.post<ApiResponse<EditorialDetectResult>>(
        "/api/tools/discrimination-remover/detect",
        { text },
      );
      return getApiData(response);
    },
    rewrite: async (
      text: string,
      spans: EditorialRewriteSpan[],
    ): Promise<SmartEditorResult> => {
      const response = await API.post<ApiResponse<{ suggestion: string }>>(
        "/api/tools/discrimination-remover/rewrite",
        { text, spans },
      );
      return getApiData(response);
    },
  },

  bulletPoints: async (text: string): Promise<SmartEditorResult> => {
    const response = await API.post<ApiResponse<{ bullets: string[] }>>(
      "/api/tools/bullet-points",
      { text },
    );
    return getApiData(response);
  },
};
