import { getApiData } from "@/lib/api-data";
import type {
  ApiResponse,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types";
import API from "./api.repository";

export const Categories_APIs = {
  list: async (): Promise<Category[]> => {
    const response = await API.get<ApiResponse<Category[]>>("/api/categories");
    return getApiData(response);
  },

  get: async (id: number | string): Promise<Category> => {
    const response = await API.get<ApiResponse<Category>>(
      `/api/categories/${id}`,
    );
    return getApiData(response);
  },

  create: async (data: CreateCategoryPayload): Promise<Category> => {
    const response = await API.post<ApiResponse<Category>>(
      "/api/categories",
      data,
    );
    return getApiData(response);
  },

  update: async (
    id: number | string,
    data: UpdateCategoryPayload,
  ): Promise<Category> => {
    const response = await API.put<ApiResponse<Category>>(
      `/api/categories/${id}`,
      data,
    );
    return getApiData(response);
  },

  delete: async (id: number | string): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/categories/${id}`,
    );
    return getApiData(response);
  },
};
