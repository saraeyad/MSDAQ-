import { getApiData } from "@/lib/api-data";
import type { ApiResponse, PublicCategory, PublicCategoryDetail } from "@/types";
import API from "./api.repository";

export const PublicCategories_APIs = {
  list: async (): Promise<PublicCategory[]> => {
    const response = await API.get<ApiResponse<PublicCategory[]>>(
      "/api/public/categories",
    );
    return getApiData(response);
  },

  getBySlug: async (slug: string, page = 1): Promise<PublicCategoryDetail> => {
    const response = await API.get<ApiResponse<PublicCategoryDetail>>(
      `/api/public/categories/${slug}`,
      { params: { page } },
    );
    return getApiData(response);
  },
};
