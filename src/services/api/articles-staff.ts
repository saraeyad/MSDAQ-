import { getApiData, parseStaffArticlesListResponse } from "@/lib/api-data";
import { normalizeStandardsResult } from "@/lib/standards-normalize";
import { appendSttAudioField } from "@/lib/voice-audio";
import {
  STANDARDS_REQUEST_TIMEOUT_MS,
  STT_REQUEST_TIMEOUT_MS,
  TTS_REQUEST_TIMEOUT_MS,
} from "@/lib/tts-limits";
import type {
  ApiResponse,
  CredibilityCheckResult,
  LocalizationResult,
  PaginatedResponse,
  StaffArticle,
  StaffArticlesListParams,
  StaffArticlesListResult,
  StaffMediaType,
  StandardsCheckResult,
  Transcript,
  TtsResult,
  VideoUploadResult,
} from "@/types";
import type { CreateSourcePayload } from "@/types";
import API from "./api.repository";

export interface CreateArticlePayload {
  title: string;
  description?: string | null;
  media_type: StaffMediaType;
  category_id: number;
  media_url?: string | null;
  sources: CreateSourcePayload[];
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
    const response = await API.get<ApiResponse<StaffArticle>>(
      `/api/articles/${id}`,
    );
    return getApiData(response);
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
      `/api/articles/${id}`,
      data,
    );
    return getApiData(response);
  },

  uploadCover: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("cover", file);
    const response = await API.postFormData<ApiResponse<{ cover_url: string }>>(
      `/api/articles/${id}/cover`,
      formData,
    );
    return getApiData(response);
  },

  deleteCover: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/articles/${id}/cover`,
    );
    return getApiData(response);
  },

  uploadBodyImages: async (id: number | string, files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("images[]", file);
    }
    const response = await API.postFormData<
      ApiResponse<{ images: StaffArticle["images"] }>
    >(`/api/articles/${id}/images`, formData);
    return getApiData(response);
  },

  deleteBodyImage: async (id: number | string, mediaId: number) => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/articles/${id}/images/${mediaId}`,
    );
    return getApiData(response);
  },

  uploadSourceAudio: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("audio", file);
    const response = await API.postFormData<ApiResponse<{ audio_url: string }>>(
      `/api/articles/${id}/source-audio`,
      formData,
    );
    return getApiData(response);
  },

  deleteSourceAudio: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/articles/${id}/source-audio`,
    );
    return getApiData(response);
  },

  uploadVideo: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await API.postFormData<ApiResponse<VideoUploadResult>>(
      `/api/articles/${id}/video`,
      formData,
    );
    return getApiData(response);
  },

  deleteVideo: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/articles/${id}/video`,
    );
    return getApiData(response);
  },

  /** Article publishing: STT from uploaded file (text articles). Not the standalone tool. */
  speechToText: async (id: number | string, file: File) => {
    const formData = new FormData();
    appendSttAudioField(formData, file);
    const response = await API.postFormData<ApiResponse<Transcript>>(
      `/api/articles/${id}/speech-to-text`,
      formData,
      { timeout: STT_REQUEST_TIMEOUT_MS },
    );
    return getApiData(response);
  },

  standardsCheck: async (id: number | string): Promise<StandardsCheckResult> => {
    const response = await API.post<ApiResponse<StandardsCheckResult>>(
      `/api/articles/${id}/standards-check`,
      {},
      { timeout: STANDARDS_REQUEST_TIMEOUT_MS },
    );
    return normalizeStandardsResult(getApiData(response));
  },

  credibilityCheck: async (id: number | string): Promise<CredibilityCheckResult> => {
    const response = await API.post<ApiResponse<CredibilityCheckResult>>(
      `/api/articles/${id}/credibility-check`,
      {},
    );
    const data = getApiData(response);
    return {
      ...data,
      claims: data.claims ?? [],
    };
  },

  generateLocalization: async (id: number | string) => {
    const response = await API.post<ApiResponse<LocalizationResult>>(
      `/api/articles/${id}/localization`,
      {},
    );
    return getApiData(response);
  },

  /** Article publishing: TTS from article body on server. Not the standalone draft library. */
  textToSpeech: async (
    id: number | string,
    data: { voice: string; style?: string },
  ): Promise<TtsResult> => {
    const response = await API.post<ApiResponse<TtsResult>>(
      `/api/articles/${id}/text-to-speech`,
      data,
      { timeout: TTS_REQUEST_TIMEOUT_MS },
    );
    return getApiData(response);
  },

  publish: async (id: number | string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      `/api/articles/${id}/publish`,
      {},
    );
    return getApiData(response);
  },

  schedule: async (id: number | string, scheduled_for: string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      `/api/articles/${id}/publish`,
      { scheduled_for },
    );
    return getApiData(response);
  },

  reschedule: async (id: number | string, scheduled_for: string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      `/api/articles/${id}/reschedule`,
      { scheduled_for },
    );
    return getApiData(response);
  },

  revert: async (id: number | string) => {
    const response = await API.post<ApiResponse<StaffArticle>>(
      `/api/articles/${id}/revert`,
      {},
    );
    return getApiData(response);
  },

  deleteArticle: async (id: number | string) => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/articles/${id}`,
    );
    return getApiData(response);
  },
};
