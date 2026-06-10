import type { JournalistArticle, StandardsCheckResult } from "@/types/journalist-article";
import type { ApiResponse } from "../types/api";
import type {
  AddArticleSourcePayload,
  ArticleSourceResponse,
  CreateArticlePayload,
  JournalistArticleResponse,
  JournalistArticlesListResponse,
  PublishArticleResponse,
  StandardsCheckResponse,
  UpdateArticlePayload,
} from "../types/journalist-articles";
import {
  mapApiArticle,
  mapApiSource,
  mapStandardsCheckResult,
} from "../types/journalist-articles";
import API from "./api.repository";

function buildArticleFormData(payload: CreateArticlePayload | UpdateArticlePayload) {
  const formData = new FormData();
  formData.append("title", payload.title?.trim() ?? "");
  formData.append("content_formal", payload.content_formal?.trim() ?? "");

  payload.tags?.forEach((tag) => {
    formData.append("tags[]", tag);
  });

  if (payload.cover_image) {
    formData.append("cover_image", payload.cover_image);
  }

  return formData;
}

function buildSourceFormData(payload: AddArticleSourcePayload) {
  const formData = new FormData();
  formData.append("source_type", payload.source_type);

  if (payload.source) formData.append("source", payload.source);
  if (payload.name) formData.append("name", payload.name);
  if (payload.email) formData.append("email", payload.email);
  if (payload.phone) formData.append("phone", payload.phone);
  if (payload.quote) formData.append("quote", payload.quote);

  return formData;
}

const JournalistArticles_APIs = {
  list: async (status?: JournalistArticle["status"]) => {
    const response = await API.get<JournalistArticlesListResponse>(
      "/api/journalist/articles",
      { params: status ? { status } : undefined },
    );

    const articles = (response.data.data ?? []).map(mapApiArticle);

    return {
      data: {
        error: response.data.error,
        message: response.data.message,
        data: articles,
      } satisfies ApiResponse<JournalistArticle[]>,
    };
  },

  getById: async (id: number | string) => {
    const response = await API.get<JournalistArticleResponse>(
      `/api/journalist/articles/${id}`,
    );

    const article = response.data.data ? mapApiArticle(response.data.data) : null;

    return {
      data: {
        error: response.data.error || !article,
        message: response.data.message,
        data: article,
      } satisfies ApiResponse<JournalistArticle>,
    };
  },

  create: async (payload: CreateArticlePayload) => {
    const response = await API.postFormData<JournalistArticleResponse>(
      "/api/journalist/articles",
      buildArticleFormData(payload),
    );

    const article = response.data.data ? mapApiArticle(response.data.data) : null;

    return {
      data: {
        error: response.data.error || !article,
        message: response.data.message,
        data: article,
      } satisfies ApiResponse<JournalistArticle>,
    };
  },

  update: async (id: number | string, payload: UpdateArticlePayload) => {
    const response = await API.putFormData<JournalistArticleResponse>(
      `/api/journalist/articles/${id}`,
      buildArticleFormData(payload),
    );

    const article = response.data.data ? mapApiArticle(response.data.data) : null;

    return {
      data: {
        error: response.data.error || !article,
        message: response.data.message,
        data: article,
      } satisfies ApiResponse<JournalistArticle>,
    };
  },

  save: async (payload: {
    id?: number;
    title: string;
    content: string;
    tags?: string[];
    cover_image?: File | null;
  }) => {
    const body: CreateArticlePayload = {
      title: payload.title,
      content_formal: payload.content,
      tags: payload.tags,
      cover_image: payload.cover_image ?? undefined,
    };

    if (payload.id) {
      return JournalistArticles_APIs.update(payload.id, body);
    }

    return JournalistArticles_APIs.create(body);
  },

  runStandardsCheck: async (articleId: number | string) => {
    const response = await API.post<StandardsCheckResponse>(
      `/api/journalist/articles/${articleId}/standards-check`,
      {},
    );

    const result = response.data.data
      ? mapStandardsCheckResult(response.data.data)
      : null;

    return {
      data: {
        error: response.data.error || !result,
        message: response.data.message,
        data: result,
      } satisfies ApiResponse<StandardsCheckResult>,
    };
  },

  addSource: async (
    articleId: number | string,
    payload: AddArticleSourcePayload,
  ) => {
    const response = await API.postFormData<ArticleSourceResponse>(
      `/api/journalist/articles/${articleId}/sources`,
      buildSourceFormData(payload),
    );

    const source = response.data.data ? mapApiSource(response.data.data) : null;

    return {
      data: {
        error: response.data.error || !source,
        message: response.data.message,
        data: source,
      } satisfies ApiResponse<JournalistArticle["sources"][number]>,
    };
  },

  deleteSource: async (articleId: number | string, sourceId: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/journalist/articles/${articleId}/sources/${sourceId}`,
    );

    return {
      data: response.data,
    };
  },

  publish: async (id: number | string) => {
    const response = await API.post<PublishArticleResponse>(
      `/api/journalist/articles/${id}/publish`,
      {},
    );

    return {
      data: response.data,
    };
  },
};

export default JournalistArticles_APIs;
