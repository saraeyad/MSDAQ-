import type {
  ApiResponse,
  PaginatedListResult,
  PaginatedResponse,
  PublicArticle,
  PublicArticlesListResult,
  PublicCategory,
  PublicCategoryDetail,
  PublicPagination,
  StaffArticle,
  StaffArticlesListResult,
} from "@/types";
import type { AxiosResponse } from "axios";
import type { AxiosError } from "axios";

/** Normalize API list payloads that may be a bare array or a paginated object. */
export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export function unwrapRecord<T extends object>(payload: unknown): T | null {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as T;
  }
  return null;
}

export function isApiSuccessful(body: ApiResponse<unknown>): boolean {
  if (typeof body.success === "boolean") return body.success;
  if (typeof body.error === "boolean") return !body.error;
  return body.data !== undefined && body.data !== null;
}

export function getApiData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const body = response.data;
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }
  return body.data;
}

export function normalizePagination(meta: {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}): PublicPagination {
  return {
    current_page: meta.current_page,
    last_page: meta.last_page,
    per_page: meta.per_page,
    total: meta.total,
  };
}

function asPageInt(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Laravel paginator fields, either on the object or in nested `meta`. */
export function readPublicPagination(source: unknown): PublicPagination | undefined {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;
  const nested =
    record.meta && typeof record.meta === "object"
      ? (record.meta as Record<string, unknown>)
      : null;
  const current_page =
    asPageInt(record.current_page) ?? asPageInt(nested?.current_page);
  const last_page = asPageInt(record.last_page) ?? asPageInt(nested?.last_page);
  const per_page = asPageInt(record.per_page) ?? asPageInt(nested?.per_page);
  const total = asPageInt(record.total) ?? asPageInt(nested?.total);
  if (
    current_page == null ||
    last_page == null ||
    per_page == null ||
    total == null
  ) {
    return undefined;
  }
  return { current_page, last_page, per_page, total };
}

type PublicCategoryDetailPayload = {
  category: PublicCategory;
  articles: PublicArticle[];
  pagination?: PublicPagination;
};

/** Parse GET /api/public/categories/:slug (meta sibling or nested pagination). */
export function parsePublicCategoryDetailResponse(
  body: ApiResponse<PublicCategoryDetailPayload>,
): PublicCategoryDetail {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }

  const data = body.data;
  const articles = data.articles ?? [];
  const pagination =
    readPublicPagination(body.meta) ??
    readPublicPagination(data.pagination) ??
    readPublicPagination(data);

  return {
    category: data.category,
    articles,
    pagination:
      pagination ??
      ({
        current_page: 1,
        last_page: 1,
        per_page: articles.length || 15,
        total: articles.length,
      } satisfies PublicPagination),
  };
}

/** Unwrap GET /api/public/articles list payloads (latest array or paginated object). */
export function unwrapPublicArticlesList(
  data: PublicArticle[] | PaginatedResponse<PublicArticle> | Record<string, unknown>,
): PublicArticlesListResult {
  if (Array.isArray(data)) {
    return { items: data };
  }
  const record = data as { data?: PublicArticle[] };
  const items = Array.isArray(record.data) ? record.data : [];
  return {
    items,
    pagination: readPublicPagination(data),
  };
}

/** Parse full envelope for GET /api/public/articles (meta may sit beside data array). */
export function parsePublicArticlesListResponse(
  body: ApiResponse<PublicArticle[] | PaginatedResponse<PublicArticle>>,
): PublicArticlesListResult {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }
  if (Array.isArray(body.data)) {
    return {
      items: body.data,
      pagination: readPublicPagination(body.meta) ?? readPublicPagination(body),
    };
  }
  const nested = unwrapPublicArticlesList(body.data);
  return {
    items: nested.items,
    pagination: nested.pagination ?? readPublicPagination(body.meta),
  };
}

/** Parse full envelope for GET /api/articles staff list (meta may sit beside data array). */
export function parseStaffArticlesListResponse(
  body: ApiResponse<StaffArticle[] | PaginatedResponse<StaffArticle>> & {
    pagination?: PublicPagination;
  },
): StaffArticlesListResult {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }

  const siblingMeta = body.meta
    ? normalizePagination(body.meta)
    : body.pagination
      ? normalizePagination(body.pagination)
      : undefined;

  if (Array.isArray(body.data)) {
    return {
      items: body.data,
      pagination: siblingMeta,
    };
  }

  const nested = body.data as PaginatedResponse<StaffArticle> & {
    pagination?: PublicPagination;
  };

  return {
    items: nested.data ?? [],
    pagination: nested.meta
      ? normalizePagination(nested.meta)
      : nested.pagination
        ? normalizePagination(nested.pagination)
        : siblingMeta,
  };
}

/** Parse full envelope for paginated list endpoints (data[] + sibling meta). */
export function parsePaginatedListResponse<T>(
  body: ApiResponse<T[] | PaginatedResponse<T>> & {
    pagination?: PublicPagination;
  },
): PaginatedListResult<T> {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }

  const siblingMeta = body.meta
    ? normalizePagination(body.meta)
    : body.pagination
      ? normalizePagination(body.pagination)
      : undefined;

  if (Array.isArray(body.data)) {
    return {
      items: body.data,
      pagination: siblingMeta,
    };
  }

  const nested = body.data as PaginatedResponse<T> & {
    pagination?: PublicPagination;
  };

  return {
    items: nested.data ?? [],
    pagination: nested.meta
      ? normalizePagination(nested.meta)
      : nested.pagination
        ? normalizePagination(nested.pagination)
        : siblingMeta,
  };
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;

    if (axiosError.code === "ECONNABORTED") {
      return "انتهت مهلة الطلب — النص قد يكون طويلاً جداً. قصّه إلى فقرة أو ملخص قصير وحاول مجدداً.";
    }

    if (axiosError.response?.status === 504) {
      return "انتهت مهلة الخادم أثناء توليد الصوت — قصّ النص وحاول مجدداً.";
    }

    const data = axiosError.response?.data;
    if (data?.errors) {
      const messages = Object.values(data.errors)
        .flat()
        .filter((msg): msg is string => !!msg?.trim());
      if (messages.length > 0) {
        return messages.join(" · ");
      }
    }
    if (data?.message) return data.message;
  }

  if (error instanceof Error) return error.message;
  return "حدث خطأ غير متوقع";
}
