import {
  isApiSuccessful,
  parsePublicCategoryDetailResponse,
} from "@/lib/api";
import type { Locale } from "@/lib/i18n/types";
import type { ApiResponse, PublicCategory, PublicCategoryDetail } from "@/types";
import API from "./api.repository";

type PublicCategoryDetailPayload = {
  category: PublicCategory;
  articles: PublicCategoryDetail["articles"];
  pagination?: PublicCategoryDetail["pagination"];
};

function normalizePublicCategory(category: PublicCategory): PublicCategory {
  return {
    ...category,
    articles_count:
      category.published_articles_count ?? category.articles_count ?? 0,
    children: (category.children ?? []).map((child) =>
      normalizePublicCategory({
        ...child,
        children: child.children ?? [],
      }),
    ),
  };
}

function normalizePublicCategoryTree(
  categories: PublicCategory[],
): PublicCategory[] {
  return categories.map(normalizePublicCategory);
}

export const PublicCategories_APIs = {
  list: async (lang: Locale = "ar"): Promise<PublicCategory[]> => {
    const response = await API.get<ApiResponse<PublicCategory[]>>(
      "/api/public/categories",
      { params: { lang } },
    );
    const body = response.data;
    if (!isApiSuccessful(body)) {
      throw new Error(body.message || "Request failed");
    }
    return normalizePublicCategoryTree(body.data);
  },

  getBySlug: async (
    slug: string,
    page = 1,
    lang: Locale = "ar",
  ): Promise<PublicCategoryDetail> => {
    const response = await API.get<
      ApiResponse<PublicCategoryDetailPayload>
    >(`/api/public/categories/${slug}`, { params: { page, lang } });
    return parsePublicCategoryDetailResponse(response.data);
  },
};
