import { getApiData } from "@/lib/api";
import {
  CREDIBILITY_REQUEST_TIMEOUT_MS,
  STANDARDS_REQUEST_TIMEOUT_MS,
  normalizeCredibilityResult,
  normalizeLocalizationResult,
  normalizeStandardsResult,
} from "@/lib/publishing";
import type {
  ApiResponse,
  CredibilityCheckResult,
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

  credibilityCheck: async (data: {
    content: string;
  }): Promise<CredibilityCheckResult> => {
    const response = await API.post<ApiResponse<CredibilityCheckResult>>(
      "/api/tools/credibility",
      data,
      { timeout: CREDIBILITY_REQUEST_TIMEOUT_MS },
    );
    return normalizeCredibilityResult(getApiData(response));
  },

  localization: async (data: { content: string }) => {
    const response = await API.post<ApiResponse<StandaloneLocalizationResult>>(
      "/api/tools/localization",
      data,
    );
    return normalizeLocalizationResult(getApiData(response));
  },
};
