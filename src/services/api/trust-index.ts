import {
  getApiData,
  isApiSuccessful,
  parsePaginatedListResponse,
} from "@/lib/api-data";
import { filenameFromContentDisposition } from "@/lib/blob-download";
import type {
  ApiResponse,
  PaginatedListResult,
  PaginatedResponse,
  TrustBand,
  TrustIndexListParams,
  TrustIndexPlatformSummaryParams,
  TrustIndexResponseRow,
  TrustIndexSubmitPayload,
  TrustIndexSummary,
} from "@/types";
import { articleIdParam } from "@/lib/article-id";
import API from "./api.repository";

function buildDateParams(params: TrustIndexListParams = {}) {
  const query: Record<string, string | number> = {};
  if (params.page != null) query.page = params.page;
  if (params.per_page != null) query.per_page = params.per_page;
  if (params.start) query.start = params.start;
  if (params.end) query.end = params.end;
  return query;
}

function buildPlatformParams(params: TrustIndexPlatformSummaryParams = {}) {
  const query = buildDateParams(params) as Record<
    string,
    string | number | number[]
  >;
  const categoryIds = (params.categories ?? []).filter((id) =>
    Number.isInteger(id),
  );
  if (categoryIds.length) {
    query["categories[]"] = categoryIds;
  }
  return query;
}

function normalizeTrustIndexResponseRow(raw: unknown): TrustIndexResponseRow | null {
  if (!raw || typeof raw !== "object") return null;

  const row = raw as Record<string, unknown>;
  const scores = row.scores as Record<string, unknown> | undefined;
  const id = Number(row.id);

  if (!Number.isFinite(id)) return null;

  return {
    id,
    created_at: String(row.created_at ?? row.createdAt ?? ""),
    scores: {
      accuracy: Number(scores?.accuracy ?? row.accuracy_score ?? row.accuracy ?? 0),
      credibility: Number(
        scores?.credibility ?? row.credibility_score ?? row.credibility ?? 0,
      ),
      objectivity: Number(
        scores?.objectivity ?? row.objectivity_score ?? row.objectivity ?? 0,
      ),
      transparency: Number(
        scores?.transparency ?? row.transparency_score ?? row.transparency ?? 0,
      ),
      ...(scores?.consistency != null ||
      row.consistency_score != null ||
      row.consistency != null
        ? {
            consistency: Number(
              scores?.consistency ?? row.consistency_score ?? row.consistency ?? 0,
            ),
          }
        : {}),
    },
    overall_score: Number(row.overall_score ?? row.overallScore ?? 0),
    trust_percentage: Number(row.trust_percentage ?? row.trustPercentage ?? 0),
    trust_level: String(row.trust_level ?? row.trustLevel ?? "medium") as TrustBand,
    comment: (row.comment as string | null | undefined) ?? null,
  };
}

function extractTrustResponseItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.responses)) return obj.responses;
    if (Array.isArray(obj.items)) return obj.items;
  }

  return [];
}

function parseTrustIndexResponsesResponse(
  body: ApiResponse<unknown>,
): PaginatedListResult<TrustIndexResponseRow> {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }

  const parsed = parsePaginatedListResponse(
    body as ApiResponse<TrustIndexResponseRow[] | PaginatedResponse<TrustIndexResponseRow>>,
  );

  const rawItems =
    parsed.items.length > 0
      ? parsed.items
      : extractTrustResponseItems(body.data);

  const items = rawItems
    .map(normalizeTrustIndexResponseRow)
    .filter((row): row is TrustIndexResponseRow => row != null);

  return { items, pagination: parsed.pagination };
}

async function fetchAllArticleResponses(
  articleId: number | string,
  params: TrustIndexListParams = {},
): Promise<PaginatedListResult<TrustIndexResponseRow>> {
  const pageSize = params.per_page ?? 100;
  let page = 1;
  let lastPage = 1;
  const allItems: TrustIndexResponseRow[] = [];

  while (page <= lastPage) {
    const response = await API.get<ApiResponse<unknown>>(
      `/api/trust-index/articles/${articleIdParam(articleId)}/responses`,
      {
        params: buildDateParams({
          ...params,
          page,
          per_page: pageSize,
        }),
      },
    );

    const parsed = parseTrustIndexResponsesResponse(response.data);
    allItems.push(...parsed.items);

    if (parsed.pagination) {
      lastPage = parsed.pagination.last_page;
    } else if (parsed.items.length < pageSize) {
      break;
    } else {
      lastPage = page + 1;
    }

    if (parsed.items.length === 0) break;
    page += 1;
  }

  return { items: allItems };
}

export const TrustIndex_APIs = {
  submitPublic: async (
    articleId: number | string,
    data: TrustIndexSubmitPayload,
  ): Promise<null> => {
    const response = await API.post<ApiResponse<null>>(
      `/api/public/articles/${articleIdParam(articleId)}/trust-index`,
      data,
    );
    return getApiData(response);
  },

  articleSummary: async (
    articleId: number | string,
    params: TrustIndexListParams = {},
  ): Promise<TrustIndexSummary> => {
    const response = await API.get<ApiResponse<TrustIndexSummary>>(
      `/api/trust-index/articles/${articleIdParam(articleId)}/summary`,
      { params: buildDateParams(params) },
    );
    return getApiData(response);
  },

  articleResponses: async (
    articleId: number | string,
    params: TrustIndexListParams = {},
  ): Promise<PaginatedListResult<TrustIndexResponseRow>> => {
    return fetchAllArticleResponses(articleId, params);
  },

  articleExport: async (
    articleId: number | string,
    params: Pick<TrustIndexListParams, "start" | "end"> = {},
  ): Promise<{ blob: Blob; filename: string }> => {
    const response = await API.get<Blob>(
      `/api/trust-index/articles/${articleIdParam(articleId)}/export`,
      {
        params: buildDateParams(params),
        responseType: "blob",
      },
    );
    const filename =
      filenameFromContentDisposition(
        response.headers["content-disposition"] as string | undefined,
      ) ?? `trust-index-article-${articleId}.xlsx`;
    return { blob: response.data, filename };
  },

  platformSummary: async (
    params: TrustIndexPlatformSummaryParams = {},
  ): Promise<TrustIndexSummary> => {
    const response = await API.get<ApiResponse<TrustIndexSummary>>(
      "/api/trust-index/platform/summary",
      { params: buildPlatformParams(params) },
    );
    return getApiData(response);
  },
};

