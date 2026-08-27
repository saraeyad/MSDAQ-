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
  PlatformFeedbackListParams,
  PlatformFeedbackSubmitPayload,
  TrustBand,
  TrustIndexResponseRow,
  TrustIndexSummary,
} from "@/types";
import API from "./api.repository";

function buildListParams(params: PlatformFeedbackListParams = {}) {
  const query: Record<string, string | number> = {};
  if (params.page != null) query.page = params.page;
  if (params.per_page != null) query.per_page = params.per_page;
  if (params.start) query.start = params.start;
  if (params.end) query.end = params.end;
  return query;
}

function normalizePlatformFeedbackResponseRow(
  raw: unknown,
): TrustIndexResponseRow | null {
  if (!raw || typeof raw !== "object") return null;

  const row = raw as Record<string, unknown>;
  const scores = row.scores as Record<string, unknown> | undefined;
  const id = Number(row.id);

  if (!Number.isFinite(id)) return null;

  const consistencyRaw =
    scores?.consistency ?? row.consistency_score ?? row.consistency;

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
      ...(consistencyRaw != null
        ? { consistency: Number(consistencyRaw) }
        : {}),
    },
    overall_score: Number(row.overall_score ?? row.overallScore ?? 0),
    trust_percentage: Number(row.trust_percentage ?? row.trustPercentage ?? 0),
    trust_level: String(row.trust_level ?? row.trustLevel ?? "medium") as TrustBand,
    comment: (row.comment as string | null | undefined) ?? null,
  };
}

function extractResponseItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.responses)) return obj.responses;
    if (Array.isArray(obj.items)) return obj.items;
  }

  return [];
}

function parsePlatformFeedbackResponsesResponse(
  body: ApiResponse<unknown>,
): PaginatedListResult<TrustIndexResponseRow> {
  if (!isApiSuccessful(body)) {
    throw new Error(body.message || "Request failed");
  }

  const parsed = parsePaginatedListResponse(
    body as ApiResponse<
      TrustIndexResponseRow[] | PaginatedResponse<TrustIndexResponseRow>
    >,
  );

  const rawItems =
    parsed.items.length > 0 ? parsed.items : extractResponseItems(body.data);

  const items = rawItems
    .map(normalizePlatformFeedbackResponseRow)
    .filter((row): row is TrustIndexResponseRow => row != null);

  return { items, pagination: parsed.pagination };
}

export const PlatformFeedback_APIs = {
  submitPublic: async (
    data: PlatformFeedbackSubmitPayload,
  ): Promise<null> => {
    const response = await API.post<ApiResponse<null>>(
      "/api/public/platform-feedback",
      data,
    );
    return getApiData(response);
  },

  summary: async (
    params: Pick<PlatformFeedbackListParams, "start" | "end"> = {},
  ): Promise<TrustIndexSummary> => {
    const response = await API.get<ApiResponse<TrustIndexSummary>>(
      "/api/platform-feedback/summary",
      { params: buildListParams(params) },
    );
    return getApiData(response);
  },

  responses: async (
    params: PlatformFeedbackListParams = {},
  ): Promise<PaginatedListResult<TrustIndexResponseRow>> => {
    const response = await API.get<ApiResponse<unknown>>(
      "/api/platform-feedback/responses",
      { params: buildListParams(params) },
    );
    return parsePlatformFeedbackResponsesResponse(response.data);
  },

  responsesAll: async (
    params: Pick<PlatformFeedbackListParams, "start" | "end"> = {},
  ): Promise<PaginatedListResult<TrustIndexResponseRow>> => {
    const pageSize = 100;
    let page = 1;
    let lastPage = 1;
    const allItems: TrustIndexResponseRow[] = [];

    while (page <= lastPage) {
      const parsed = await PlatformFeedback_APIs.responses({
        ...params,
        page,
        per_page: pageSize,
      });
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
  },

  export: async (
    params: Pick<PlatformFeedbackListParams, "start" | "end"> = {},
  ): Promise<{ blob: Blob; filename: string }> => {
    const response = await API.get<Blob>("/api/platform-feedback/export", {
      params: buildListParams(params),
      responseType: "blob",
    });
    const filename =
      filenameFromContentDisposition(
        response.headers["content-disposition"] as string | undefined,
      ) ?? "platform-feedback.xlsx";
    return { blob: response.data, filename };
  },
};
