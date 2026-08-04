import type {
  ApiResponse,
  PaginatedListResult,
  PaginatedResponse,
  PublicArticle,
  PublicArticlesListResult,
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

function normalizePagination(meta: {
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

/** Unwrap GET /api/public/articles list payloads (latest array or paginated object). */
export function unwrapPublicArticlesList(
  data: PublicArticle[] | PaginatedResponse<PublicArticle>,
): PublicArticlesListResult {
  if (Array.isArray(data)) {
    return { items: data };
  }
  return {
    items: data.data ?? [],
    pagination: data.meta ? normalizePagination(data.meta) : undefined,
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
      pagination: body.meta ? normalizePagination(body.meta) : undefined,
    };
  }
  return unwrapPublicArticlesList(body.data);
}

/** Parse full envelope for GET /api/articles staff list (meta may sit beside data array). */
export function parseStaffArticlesListResponse(
  body: ApiResponse<StaffArticle[] | PaginatedResponse<StaffArticle>>,
): StaffArticlesListResult {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }
  if (Array.isArray(body.data)) {
    return {
      items: body.data,
      pagination: body.meta ? normalizePagination(body.meta) : undefined,
    };
  }
  return {
    items: body.data.data ?? [],
    pagination: body.data.meta
      ? normalizePagination(body.data.meta)
      : undefined,
  };
}

/** Parse full envelope for paginated list endpoints (data[] + sibling meta). */
export function parsePaginatedListResponse<T>(
  body: ApiResponse<T[] | PaginatedResponse<T>>,
): PaginatedListResult<T> {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }
  if (Array.isArray(body.data)) {
    return {
      items: body.data,
      pagination: body.meta ? normalizePagination(body.meta) : undefined,
    };
  }
  return {
    items: body.data.data ?? [],
    pagination: body.data.meta
      ? normalizePagination(body.data.meta)
      : undefined,
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
