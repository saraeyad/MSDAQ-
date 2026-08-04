import { getApiData } from "@/lib/api-data";
import type { ApiResponse, DomainCheckResult } from "@/types";
import API from "./api.repository";

export const DomainCheck_APIs = {
  check: async (domain: string): Promise<DomainCheckResult> => {
    const response = await API.post<ApiResponse<DomainCheckResult>>(
      "/api/domain-check",
      { domain },
    );
    return getApiData(response);
  },
};
