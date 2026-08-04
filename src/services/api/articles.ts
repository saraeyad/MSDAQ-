import {
  getApiData,
  parsePublicArticlesListResponse,
} from "@/lib/api-data";
import type {
  PaginatedResponse,
  PublicArticle,
  PublicArticlesListResult,
} from "@/types";
import type { ApiResponse } from "@/types";
import API from "./api.repository";

export interface ArticlesQuery {
  latest?: boolean;
  search?: string;
  media_type?: string;
  category?: number;
  page?: number;
}

async function fetchListFromApi(
  params?: ArticlesQuery,
): Promise<PublicArticlesListResult> {
  const response = await API.get<
    ApiResponse<PublicArticle[] | PaginatedResponse<PublicArticle>>
  >("/api/public/articles", { params });
  return parsePublicArticlesListResponse(response.data);
}

export const Articles_APIs = {
  list: (params?: ArticlesQuery): Promise<PublicArticlesListResult> =>
    fetchListFromApi(params),

  get: async (id: number | string): Promise<PublicArticle> => {
    const response = await API.get<ApiResponse<PublicArticle>>(
      `/api/public/articles/${id}`,
    );
    return getApiData(response);
  },
};
