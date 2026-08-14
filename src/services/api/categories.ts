import { getApiData } from "@/lib/api-data";
import type {
  ApiResponse,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types";
import API from "./api.repository";

function normalizeCategoryTree(categories: Category[]): Category[] {
  return categories.map((category) => ({
    ...category,
    children: (category.children ?? []).map((child) => ({
      ...child,
      children: child.children ?? [],
    })),
  }));
}

export interface CategoriesListOptions {
  all?: boolean;
}

export const Categories_APIs = {
  list: async (options?: CategoriesListOptions): Promise<Category[]> => {
    const response = await API.get<ApiResponse<Category[]>>("/api/categories", {
      params: options?.all ? { all: true } : undefined,
    });
    return normalizeCategoryTree(getApiData(response));
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
