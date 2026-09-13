import { getApiData } from "@/lib/api";
import type { ApiResponse, EntitySearchResult } from "@/types";
import API from "./api.repository";

export const Entities_APIs = {
  /** GET /entities/search — `edit-articles`. Empty `q` returns []. */
  search: async (q: string): Promise<EntitySearchResult[]> => {
    const query = q.trim();
    if (!query) return [];

    const response = await API.get<ApiResponse<EntitySearchResult[]>>(
      "/api/entities/search",
      { params: { q: query } },
    );
    return getApiData(response) ?? [];
  },
};
