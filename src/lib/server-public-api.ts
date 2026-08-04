/** SSR-only public API fetch helpers (native fetch — no axios/localStorage). */
import { isApiSuccessful } from "@/lib/api-data";
import type {
  ApiResponse,
  PublicArticle,
  PublicCategoryDetail,
} from "@/types";

const DEFAULT_API_URL = "https://misdaq-production-1ff3.up.railway.app";

function getApiBaseUrl(): string {
  return import.meta.env.VITE_HOST_API || DEFAULT_API_URL;
}

export class PublicApiNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "PublicApiNotFoundError";
  }
}

async function fetchPublicApi<T>(path: string): Promise<T> {
  const url = `${getApiBaseUrl().replace(/\/$/, "")}${path}`;
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

export async function fetchPublicArticle(
  id: number | string,
): Promise<PublicArticle> {
  return fetchPublicApi<PublicArticle>(`/api/public/articles/${id}`);
}

export async function fetchPublicCategory(
  slug: string,
  page = 1,
): Promise<PublicCategoryDetail> {
  const query = page > 1 ? `?page=${page}` : "";
  return fetchPublicApi<PublicCategoryDetail>(
    `/api/public/categories/${slug}${query}`,
  );
}
