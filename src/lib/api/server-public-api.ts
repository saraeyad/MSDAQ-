/** SSR-only public API fetch helpers (native fetch — no axios/localStorage). */
import {
  isApiSuccessful,
  parsePublicCategoryDetailResponse,
} from "./api-data";
import type {
  ApiResponse,
  PublicArticle,
  PublicCategoryDetail,
} from "@/types";

import type { Locale } from "@/lib/i18n/types";
import { articleIdParam } from "../publishing/article-id";
import { apiBaseUrl } from "./api-origin";

export class PublicApiNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "PublicApiNotFoundError";
  }
}

async function fetchPublicApi<T>(
  path: string,
  locale: Locale = "ar",
): Promise<T> {
  const url = `${apiBaseUrl().replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
  });

  if (response.status === 404) {
    throw new PublicApiNotFoundError();
  }

  if (!response.ok) {
    throw new Error(`Public API request failed (${response.status})`);
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }

  return body.data;
}

async function fetchPublicApiEnvelope<T>(
  path: string,
  locale: Locale = "ar",
): Promise<ApiResponse<T>> {
  const url = `${apiBaseUrl().replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
    },
  });

  if (response.status === 404) {
    throw new PublicApiNotFoundError();
  }

  if (!response.ok) {
    throw new Error(`Public API request failed (${response.status})`);
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }

  return body;
}

export async function fetchPublicArticle(
  id: number | string,
  locale: Locale = "ar",
): Promise<PublicArticle> {
  return fetchPublicApi<PublicArticle>(
    `/api/public/articles/${articleIdParam(id)}?lang=${locale}`,
    locale,
  );
}

type PublicCategoryDetailPayload = {
  category: PublicCategoryDetail["category"];
  articles: PublicCategoryDetail["articles"];
  pagination?: PublicCategoryDetail["pagination"];
};

export async function fetchPublicCategory(
  slug: string,
  page = 1,
  locale: Locale = "ar",
): Promise<PublicCategoryDetail> {
  const search = new URLSearchParams({ lang: locale });
  if (page > 1) search.set("page", String(page));
  const body = await fetchPublicApiEnvelope<PublicCategoryDetailPayload>(
    `/api/public/categories/${slug}?${search.toString()}`,
    locale,
  );
  return parsePublicCategoryDetailResponse(body);
}
