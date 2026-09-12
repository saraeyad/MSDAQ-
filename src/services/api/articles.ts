import {
  getApiData,
  parsePublicArticlesListResponse,
} from "@/lib/api";
import { normalizeArticleMedia } from "@/lib/media/article-media";
import type {
  PaginatedResponse,
  PublicArticle,
  PublicArticleMedia,
  PublicArticlesListResult,
} from "@/types";
import type { ApiResponse } from "@/types";
import { articleIdParam } from "@/lib/publishing";
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
      `/api/public/articles/${articleIdParam(id)}`,
    );
    return getApiData(response);
  },

  /** Call only when the reader presses play — never on page load. */
  getMedia: async (id: number | string): Promise<PublicArticleMedia> => {
    const response = await API.get<ApiResponse<PublicArticleMedia>>(
      `/api/public/articles/${articleIdParam(id)}/media`,
    );
    return normalizeArticleMedia(getApiData(response));
  },
};
