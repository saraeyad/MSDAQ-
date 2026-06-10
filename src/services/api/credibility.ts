import type { CredibilityCheckResult } from "@/types/credibility";
import API from "./api.repository";
import type { ApiResponse } from "../types/api";
import {
  mapCredibilityCheckResult,
  type CredibilityCheckResponse,
} from "../types/credibility";

export type CredibilityCheckPayload = {
  content: string;
};

const Credibility_APIs = {
  check: async (payload: CredibilityCheckPayload) => {
    const formData = new FormData();
    formData.append("content", payload.content);

    const response = await API.postFormData<CredibilityCheckResponse>(
      "/api/credibility-checks",
      formData,
    );

    const result = response.data.data
      ? mapCredibilityCheckResult(response.data.data)
      : null;

    return {
      data: {
        error: response.data.error || !result,
        message: response.data.message,
        data: result,
      } satisfies ApiResponse<CredibilityCheckResult>,
    };
  },
};

export default Credibility_APIs;
