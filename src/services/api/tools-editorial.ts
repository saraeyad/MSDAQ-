import { getApiData } from "@/lib/api-data";
import { normalizeLocalizationResult } from "@/lib/localization-normalize";
import { normalizeStandardsResult } from "@/lib/standards-normalize";
import { STANDARDS_REQUEST_TIMEOUT_MS } from "@/lib/tts-limits";
import type {
  ApiResponse,
  StandaloneCredibilityResult,
  StandaloneLocalizationResult,
  StandardsCheckResult,
} from "@/types";
import API from "./api.repository";

export const ToolsEditorial_APIs = {
  standardsCheck: async (data: {
    content: string;
    title?: string;
  }): Promise<StandardsCheckResult> => {
    const response = await API.post<ApiResponse<StandardsCheckResult>>(
      "/api/tools/standards-check",
      data,
      { timeout: STANDARDS_REQUEST_TIMEOUT_MS },
    );
    return normalizeStandardsResult(getApiData(response));
  },

  credibilityCheck: async (data: { content: string }) => {
    const response = await API.post<ApiResponse<StandaloneCredibilityResult>>(
      "/api/tools/credibility",
      data,
    );
    return getApiData(response);
  },

  localization: async (data: { content: string }) => {
    const response = await API.post<ApiResponse<StandaloneLocalizationResult>>(
      "/api/tools/localization",
      data,
    );
    return normalizeLocalizationResult(getApiData(response));
  },
};
