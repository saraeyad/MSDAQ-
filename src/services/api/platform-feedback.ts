import { getApiData, parsePaginatedListResponse } from "@/lib/api-data";
import type {
  ApiResponse,
  PaginatedListResult,
  PaginatedResponse,
  PlatformFeedbackItem,
  PlatformFeedbackListParams,
  PlatformFeedbackSubmitPayload,
} from "@/types";
import API from "./api.repository";

function buildListParams(params: PlatformFeedbackListParams = {}) {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.start) query.start = params.start;
  if (params.end) query.end = params.end;
  return query;
}

export const PlatformFeedback_APIs = {
  submitPublic: async (
    data: PlatformFeedbackSubmitPayload,
  ): Promise<null> => {
    const response = await API.post<ApiResponse<null>>(
      "/api/public/platform-feedback",
      data,
    );
    return getApiData(response);
  },

  list: async (
    params: PlatformFeedbackListParams = {},
  ): Promise<PaginatedListResult<PlatformFeedbackItem>> => {
    const response = await API.get<
      ApiResponse<PlatformFeedbackItem[] | PaginatedResponse<PlatformFeedbackItem>>
    >("/api/platform-feedback", { params: buildListParams(params) });
    return parsePaginatedListResponse(response.data);
  },
};
