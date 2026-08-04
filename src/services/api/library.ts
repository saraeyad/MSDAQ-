import { getApiData, parsePaginatedListResponse } from "@/lib/api-data";
import type {
  ApiResponse,
  LibraryItem,
  LibraryListParams,
  PaginatedListResult,
  PaginatedResponse,
  UpdateLibraryItemPayload,
} from "@/types";
import API from "./api.repository";

export const Library_APIs = {
  list: async (
    params: LibraryListParams = {},
  ): Promise<PaginatedListResult<LibraryItem>> => {
    const response = await API.get<
      ApiResponse<LibraryItem[] | PaginatedResponse<LibraryItem>>
    >("/api/library", { params });
    return parsePaginatedListResponse(response.data);
  },

  get: async (id: number | string): Promise<LibraryItem> => {
    const response = await API.get<ApiResponse<LibraryItem>>(
      `/api/library/${id}`,
    );
    return getApiData(response);
  },

  upload: async (formData: FormData): Promise<LibraryItem> => {
    const response = await API.postFormData<ApiResponse<LibraryItem>>(
      "/api/library",
      formData,
    );
    return getApiData(response);
  },

  update: async (
    id: number | string,
    data: UpdateLibraryItemPayload,
  ): Promise<LibraryItem> => {
    const response = await API.put<ApiResponse<LibraryItem>>(
      `/api/library/${id}`,
      data,
    );
    return getApiData(response);
  },

  delete: async (id: number | string): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/library/${id}`,
    );
    return getApiData(response);
  },

  download: async (id: number | string): Promise<Blob> => {
    const response = await API.get<Blob>(`/api/library/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },
};
