import type { StandardsCheckResult } from "@/types/journalist-article";
import API from "./api.repository";
import type { ApiResponse } from "../types/api";
import {
  mapStandardsCheckResult,
  type StandardsCheckResponse,
} from "../types/journalist-articles";

export type StandardsCheckPayload = {
  content: string;
};

const StandardsCheck_APIs = {
  check: async (payload: StandardsCheckPayload) => {
    const formData = new FormData();
    formData.append("content", payload.content);

    const response = await API.postFormData<StandardsCheckResponse>(
      "/api/standards-check",
      formData,
    );

    const result = response.data.data
      ? mapStandardsCheckResult(response.data.data)
      : null;

    return {
      data: {
        error: response.data.error || !result,
        message: response.data.message,
        data: result,
      } satisfies ApiResponse<StandardsCheckResult>,
    };
  },
};

export default StandardsCheck_APIs;
