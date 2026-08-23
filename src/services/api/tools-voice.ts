import { getApiData, parsePaginatedListResponse } from "@/lib/api-data";
import { appendSttAudioField } from "@/lib/voice-audio";
import { TTS_REQUEST_TIMEOUT_MS, STT_REQUEST_TIMEOUT_MS } from "@/lib/tts-limits";
import type {
  ApiResponse,
  GeneratedAudio,
  PaginatedListResult,
  PaginatedResponse,
  Transcript,
  TtsVoice,
} from "@/types";
import type { AxiosRequestConfig } from "axios";
import API from "./api.repository";

type UploadProgressOptions = Pick<AxiosRequestConfig, "onUploadProgress">;

/** Standalone newsroom tools — draft → save lifecycle (not article-scoped). */
export const ToolsVoice_APIs = {
  textToSpeech: async (data: {
    text: string;
    voice: string;
    style?: string;
  }): Promise<GeneratedAudio> => {
    const response = await API.post<ApiResponse<GeneratedAudio>>(
      "/api/tools/text-to-speech",
      data,
      { timeout: TTS_REQUEST_TIMEOUT_MS },
    );
    return getApiData(response);
  },

  speechToText: async (
    file: File,
    options?: UploadProgressOptions,
  ): Promise<Transcript> => {
    const formData = new FormData();
    appendSttAudioField(formData, file);
    const response = await API.postFormData<ApiResponse<Transcript>>(
      "/api/tools/speech-to-text",
      formData,
      { timeout: STT_REQUEST_TIMEOUT_MS, ...options },
    );
    return getApiData(response);
  },

  listGeneratedAudios: async (
    page = 1,
  ): Promise<PaginatedListResult<GeneratedAudio>> => {
    const response = await API.get<
      ApiResponse<GeneratedAudio[] | PaginatedResponse<GeneratedAudio>>
    >("/api/tools/generated-audios", { params: { page } });
    return parsePaginatedListResponse(response.data);
  },

  getGeneratedAudio: async (id: number | string): Promise<GeneratedAudio> => {
    const response = await API.get<ApiResponse<GeneratedAudio>>(
      `/api/tools/generated-audios/${id}`,
    );
    return getApiData(response);
  },

  saveGeneratedAudio: async (
    id: number | string,
    data: { name: string },
  ): Promise<GeneratedAudio> => {
    const response = await API.post<ApiResponse<GeneratedAudio>>(
      `/api/tools/generated-audios/${id}/save`,
      data,
    );
    return getApiData(response);
  },

  deleteGeneratedAudio: async (id: number | string): Promise<null> => {
    const response = await API.delete<ApiResponse<null>>(
      `/api/tools/generated-audios/${id}`,
    );
    return getApiData(response);
  },
};

export const Tts_APIs = {
  getVoices: async () => {
    const response = await API.get<ApiResponse<TtsVoice[]>>(
      "/api/tools/tts-voices",
    );
    return getApiData(response);
  },
};
