import { getApiData, parsePaginatedListResponse } from "@/lib/api-data";
import type {
  ApiResponse,
  PaginatedListResult,
  PaginatedResponse,
  Transcript,
} from "@/types";
import API from "./api.repository";

export const Transcripts_APIs = {
  list: async (page = 1): Promise<PaginatedListResult<Transcript>> => {
    const response = await API.get<
      ApiResponse<Transcript[] | PaginatedResponse<Transcript>>
    >("/api/transcripts", { params: { page } });
    return parsePaginatedListResponse(response.data);
  },

  get: async (id: number | string): Promise<Transcript> => {
    const response = await API.get<ApiResponse<Transcript>>(
      `/api/transcripts/${id}`,
    );
    return getApiData(response);
  },

  /** Step 2: POST /api/transcripts/{id}/save — promote draft by id */
  save: async (
    id: number | string,
    data: { name: string; transcript?: string },
  ): Promise<Transcript> => {
    const response = await API.post<ApiResponse<Transcript>>(
      `/api/transcripts/${id}/save`,
      data,
    );
    return getApiData(response);
  },

  delete: async (id: number | string): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/transcripts/${id}`,
    );
    return getApiData(response);
  },
};
