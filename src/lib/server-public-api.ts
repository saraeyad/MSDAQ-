/** SSR-only public API fetch helpers (native fetch — no axios/localStorage). */
import {
  isApiSuccessful,
  parsePublicCategoryDetailResponse,
} from "@/lib/api-data";
import type {
  ApiResponse,
  PublicArticle,
  PublicCategoryDetail,
} from "@/types";

import { articleIdParam } from "@/lib/article-id";
import { apiBaseUrl } from "@/lib/api-origin";

export class PublicApiNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "PublicApiNotFoundError";
  }
}

async function fetchPublicApi<T>(path: string): Promise<T> {
  const url = `${apiBaseUrl().replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "ar",
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
): Promise<ApiResponse<T>> {
  const url = `${apiBaseUrl().replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "ar",
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
): Promise<PublicArticle> {
  return fetchPublicApi<PublicArticle>(
    `/api/public/articles/${articleIdParam(id)}`,
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
): Promise<PublicCategoryDetail> {
  const query = page > 1 ? `?page=${page}` : "";
  const body = await fetchPublicApiEnvelope<PublicCategoryDetailPayload>(
    `/api/public/categories/${slug}${query}`,
  );
  return parsePublicCategoryDetailResponse(body);
}
