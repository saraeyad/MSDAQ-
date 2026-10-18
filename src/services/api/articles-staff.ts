import { getApiData, parseStaffArticlesListResponse } from "@/lib/api";
import {
  normalizeAiCheck,
  normalizeAiCheckList,
  normalizeStandardsResult,
} from "@/lib/publishing";
import { appendSttAudioField, normalizeArticleMedia } from "@/lib/media";
import { STANDARDS_REQUEST_TIMEOUT_MS } from "@/lib/publishing";
import type {
  AiCheck,
  AiCheckType,
  ApiResponse,
  ArticleMedia,
  LocalizationResult,
  PaginatedResponse,
  StaffArticle,
  StaffArticlesListParams,
  StaffArticlesListResult,
  StaffMediaType,
  Transcript,
  GeneratedAudio,
  VideoUploadResult,
} from "@/types";
import type {
  CreateSourcePayload,
  EntityWritePayload,
  UpdateSourcePayload,
} from "@/types";
import { articleIdParam } from "@/lib/publishing";
import type { AxiosRequestConfig } from "axios";
import API from "./api.repository";

type UploadProgressOptions = Pick<AxiosRequestConfig, "onUploadProgress">;

function articleUrl(id: number | string, suffix = "") {
  return `/api/articles/${articleIdParam(id)}${suffix}`;
}

export interface CreateArticlePayload {
  title: string;
  description?: string | null;
  media_type: StaffMediaType;
  category_id: number;
  media_url?: string | null;
  sources: CreateSourcePayload[];
  entities?: EntityWritePayload[];
  review_target?: number;
  review_limit?: number;
}

export interface UpdateArticlePayload {
  title?: string;
  description?: string | null;
  media_type?: StaffMediaType;
  category_id?: number;
  media_url?: string | null;
  content_formal?: string;
  content_simplified?: string;
  content_dialect?: string;
  sources?: UpdateSourcePayload[];
  /** Omit to leave tags untouched. Include (even `[]`) for a full replace. */
  entities?: EntityWritePayload[];
  review_target?: number | null;
  review_limit?: number | null;
}

export const ArticlesStaff_APIs = {
  list: async (
    params?: StaffArticlesListParams,
  ): Promise<StaffArticlesListResult> => {
    const response = await API.get<
      ApiResponse<StaffArticle[] | PaginatedResponse<StaffArticle>>
    >("/api/articles", {
      params: {
        status: params?.status,
        category: params?.category,
        page: params?.page,
        per_page: params?.per_page,
        mine: params?.mine ? 1 : undefined,
      },
    });
    return parseStaffArticlesListResponse(response.data);
  },

  getArticle: async (id: number | string): Promise<StaffArticle> => {
    const response = await API.get<ApiResponse<StaffArticle>>(articleUrl(id));
    return getApiData(response);
  },

  /** Same payload as public /media — call when staff need the playable source. */
  getMedia: async (id: number | string): Promise<ArticleMedia> => {
    const response = await API.get<ApiResponse<ArticleMedia>>(
      articleUrl(id, "/media"),
    );
    return normalizeArticleMedia(getApiData(response));
  },

  createArticle: async (data: CreateArticlePayload): Promise<StaffArticle> => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      "/api/articles",
      data,
    );
    return getApiData(response);
  },

  updateArticle: async (
    id: number | string,
    data: UpdateArticlePayload,
  ): Promise<StaffArticle> => {
    const response = await API.put<ApiResponse<StaffArticle>>(
      articleUrl(id),
      data,
    );
    return getApiData(response);
  },

  uploadCover: async (
    id: number | string,
    file: File,
    options?: UploadProgressOptions,
  ) => {
    const formData = new FormData();
    formData.append("cover", file);
    const response = await API.postFormData<
      ApiResponse<{ cover_url: string; cover_description?: string | null }>
    >(articleUrl(id, "/cover"), formData, options);
    return getApiData(response);
  },

  updateCoverDescription: async (
    id: number | string,
    description: string,
  ) => {
    const response = await API.patch<
      ApiResponse<{ cover_description?: string | null }>
    >(articleUrl(id, "/cover/description"), {
      description: description.trim().slice(0, 500),
    });
    return getApiData(response);
  },

  deleteCover: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      articleUrl(id, "/cover"),
    );
    return getApiData(response);
  },

  uploadBodyImages: async (
    id: number | string,
    files: File[],
    options?: UploadProgressOptions,
  ) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("images[]", file);
    }
    const response = await API.postFormData<
      ApiResponse<{ images: StaffArticle["images"] }>
    >(`${articleUrl(id, "/images")}`, formData, options);
    return getApiData(response);
  },

  deleteBodyImage: async (id: number | string, mediaId: number) => {
    const response = await API.delete<ApiResponse<null>>(
      `${articleUrl(id, "/images")}/${mediaId}`,
    );
    return getApiData(response);
  },

  uploadSourceAudio: async (
    id: number | string,
    file: File,
    options?: UploadProgressOptions,
  ) => {
    const formData = new FormData();
    formData.append("audio", file);
    const response = await API.postFormData<ApiResponse<{ audio_url: string }>>(
      articleUrl(id, "/source-audio"),
      formData,
      options,
    );
    return getApiData(response);
  },

  deleteSourceAudio: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      articleUrl(id, "/source-audio"),
    );
    return getApiData(response);
  },

  uploadVideo: async (
    id: number | string,
    file: File,
    options?: UploadProgressOptions,
  ) => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await API.postFormData<ApiResponse<VideoUploadResult>>(
      articleUrl(id, "/video"),
      formData,
      options,
    );
    return getApiData(response);
  },

  deleteVideo: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      articleUrl(id, "/video"),
    );
    return getApiData(response);
  },

  /** Article publishing: STT from uploaded file (text articles). Not the standalone tool. */
  speechToText: async (
    id: number | string,
    file: File,
    options?: UploadProgressOptions,
  ) => {
    const formData = new FormData();
    appendSttAudioField(formData, file);
    const response = await API.postFormData<ApiResponse<Transcript>>(
      articleUrl(id, "/speech-to-text"),
      formData,
      options,
    );
    return getApiData(response);
  },

  /**
   * Saved standards / credibility history for an article.
   * `GET /articles/{id}/ai-checks?type=credibility|standards`
   * Used on publishing steps and staff article detail to show prior results.
   */
  listAiChecks: async (
    id: number | string,
    type: AiCheckType,
  ): Promise<AiCheck[]> => {
    const response = await API.get<ApiResponse<unknown>>(
      articleUrl(id, "/ai-checks"),
      { params: { type } },
    );
    return normalizeAiCheckList(getApiData(response));
  },

  /** Single check row — polling target for async credibility. */
  getAiCheck: async (
    articleId: number | string,
    checkId: number | string,
  ): Promise<AiCheck> => {
    const response = await API.get<ApiResponse<unknown>>(
      articleUrl(articleId, `/ai-checks/${checkId}`),
    );
    const row = normalizeAiCheck(getApiData(response));
    if (!row) {
      throw new Error("Invalid AI check response");
    }
    return row;
  },

  /** Synchronous — saves a `done` row and updates article gate fields. */
  runStandardsCheck: async (id: number | string): Promise<AiCheck> => {
    const response = await API.post<ApiResponse<unknown>>(
      articleUrl(id, "/standards-check"),
      {},
      { timeout: STANDARDS_REQUEST_TIMEOUT_MS },
    );
    const payload = getApiData(response);
    const row = normalizeAiCheck(payload);
    if (row) return row;
    const articleIdNum = Number(articleIdParam(id));
    const legacy = normalizeStandardsResult(
      payload as Parameters<typeof normalizeStandardsResult>[0],
    );
    return {
      id: 0,
      article_id: Number.isFinite(articleIdNum) ? articleIdNum : 0,
      type: "standards",
      status: "done",
      score: legacy.total_score,
      result: legacy,
      error_message: null,
      reason: null,
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    };
  },

  /** Async — returns queued row; poll with `getAiCheck`. */
  enqueueCredibilityCheck: async (id: number | string): Promise<AiCheck> => {
    const response = await API.post<ApiResponse<unknown>>(
      articleUrl(id, "/credibility-check"),
      {},
    );
    const row = normalizeAiCheck(getApiData(response));
    if (row) return row;
    throw new Error("Invalid credibility check response");
  },

  generateLocalization: async (id: number | string) => {
    const response = await API.post<ApiResponse<LocalizationResult>>(
      articleUrl(id, "/localization"),
      {},
    );
    return getApiData(response);
  },

  /**
   * Registers the article voice. The backend stores it and starts the job on publish.
   * Omit voice so the backend uses its default.
   */
  textToSpeech: async (
    id: number | string,
    data: { voice?: string } = {},
  ): Promise<GeneratedAudio> => {
    const voice = data.voice?.trim();
    const response = await API.post<ApiResponse<GeneratedAudio>>(
      articleUrl(id, "/text-to-speech"),
      voice ? { voice } : {},
    );
    return getApiData(response);
  },

  publish: async (id: number | string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      articleUrl(id, "/publish"),
      {},
    );
    return getApiData(response);
  },

  /** Retry DeepL translation after a failure — not part of the normal publish flow. */
  translate: async (id: number | string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      articleUrl(id, "/translate"),
      {},
    );
    return getApiData(response);
  },

  schedule: async (id: number | string, scheduled_for: string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      articleUrl(id, "/publish"),
      { scheduled_for },
    );
    return getApiData(response);
  },

  reschedule: async (id: number | string, scheduled_for: string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      articleUrl(id, "/reschedule"),
      { scheduled_for },
    );
    return getApiData(response);
  },

  revert: async (id: number | string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      articleUrl(id, "/revert"),
      {},
    );
    return getApiData(response);
  },

  deleteArticle: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(articleUrl(id));
    return getApiData(response);
  },
};
