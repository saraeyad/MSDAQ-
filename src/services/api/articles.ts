import type {
  ArticleDetailResponse,
  ArticlesListParams,
  ArticlesListResponse,
} from "../types/articles";
import API from "./api.repository";

const Articles_APIs = {
  getAll: async (params: ArticlesListParams = {}) => {
    return API.get<ArticlesListResponse>("/api/articles", { params });
  },

  getById: async (id: number | string) => {
    return API.get<ArticleDetailResponse>(`/api/articles/${id}`);
  },
};

export default Articles_APIs;
