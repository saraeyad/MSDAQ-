import { getApiData, parsePaginatedListResponse } from "@/lib/api-data";
import { appendSttAudioField } from "@/lib/voice-audio";
import { TTS_REQUEST_TIMEOUT_MS, STT_REQUEST_TIMEOUT_MS } from "@/lib/tts-limits";
import type {
  AiDetectionResult,
  ApiResponse,
  GeneratedAudio,
  PaginatedListResult,
  PaginatedResponse,
  ReverseSearchMatch,
  SmartEditorResult,
  StandaloneCredibilityResult,
  StandaloneLocalizationResult,
  StandaloneStandardsResult,
  Transcript,
  TtsVoice,
} from "@/types";
import API from "./api.repository";

export const SmartEditor_APIs = {
  fushaRewriter: async (text: string): Promise<SmartEditorResult> => {
    const response = await API.post<ApiResponse<{ suggestion: string }>>(
      "/api/tools/fusha-rewriter",
      { text },
    );
    return getApiData(response);
  },

  biasNeutralizer: async (text: string): Promise<SmartEditorResult> => {
    const response = await API.post<ApiResponse<{ suggestion: string }>>(
      "/api/tools/bias-neutralizer",
      { text },
    );
    return getApiData(response);
  },

  discriminationRemover: async (text: string): Promise<SmartEditorResult> => {
    const response = await API.post<ApiResponse<{ suggestion: string }>>(
      "/api/tools/discrimination-remover",
      { text },
    );
    return getApiData(response);
  },

  bulletPoints: async (text: string): Promise<SmartEditorResult> => {
    const response = await API.post<ApiResponse<{ bullets: string[] }>>(
      "/api/tools/bullet-points",
      { text },
    );
    return getApiData(response);
  },
};

function unwrapReverseSearchMatches(payload: unknown): ReverseSearchMatch[] {
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { results?: unknown }).results)
  ) {
    return (payload as { results: ReverseSearchMatch[] }).results;
  }
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: ReverseSearchMatch[] }).data;
  }
  return [];
}

export const ImageVerification_APIs = {
  /**
   * POST /api/tools/reverse-search
   * - Public URL → JSON `{ image_url }` (same path as publishing flow)
   * - Device file → multipart `image_file` (API collection contract)
   */
  reverseSearch: async (input: string | { file?: File; imageUrl?: string }) => {
    const file = typeof input === "string" ? undefined : input.file;
    const imageUrl =
      typeof input === "string" ? input.trim() : input.imageUrl?.trim();

    if (!file && !imageUrl) {
      throw new Error("أدخل رابط صورة عام أو ارفع ملف صورة");
    }

    if (file) {
      const formData = new FormData();
      formData.append("image_file", file);
      const response = await API.postFormData<
        ApiResponse<ReverseSearchMatch[] | { results?: ReverseSearchMatch[] }>
      >("/api/tools/reverse-search", formData);
      return unwrapReverseSearchMatches(getApiData(response));
    }

    const response = await API.post<
      ApiResponse<ReverseSearchMatch[] | { results?: ReverseSearchMatch[] }>
    >("/api/tools/reverse-search", { image_url: imageUrl });
    return unwrapReverseSearchMatches(getApiData(response));
  },

  aiDetection: async (input: { file?: File; imageUrl?: string }) => {
    const formData = new FormData();
    if (input.file) formData.append("image_file", input.file);
    else if (input.imageUrl) formData.append("image_url", input.imageUrl);
    const response = await API.postFormData<ApiResponse<AiDetectionResult>>(
      "/api/tools/ai-detect",
      formData,
    );
    return getApiData(response);
  },
};

export const Tts_APIs = {
  getVoices: async (): Promise<TtsVoice[]> => {
    const response = await API.get<ApiResponse<TtsVoice[]>>(
      "/api/tools/tts-voices",
    );
    return getApiData(response);
  },
};

/** Standalone newsroom tools — draft → save lifecycle (not article-scoped). */
export const ToolsVoice_APIs = {
  /** Step 1: POST /api/tools/text-to-speech → draft GeneratedAudio */
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

  /** Step 1: POST /api/tools/speech-to-text → draft Transcript */
  speechToText: async (file: File): Promise<Transcript> => {
    const formData = new FormData();
    appendSttAudioField(formData, file);
    const response = await API.postFormData<ApiResponse<Transcript>>(
      "/api/tools/speech-to-text",
      formData,
      { timeout: STT_REQUEST_TIMEOUT_MS },
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

  /** Step 2: POST /api/tools/generated-audios/{id}/save */
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

function normalizeStandardsBreakdown(
  payload: StandaloneStandardsResult & {
    criteria?: StandaloneStandardsResult["breakdown"];
    breakdown?:
      | StandaloneStandardsResult["breakdown"]
      | Record<string, Omit<StandaloneStandardsResult["breakdown"][number], "key">>;
  },
): StandaloneStandardsResult["breakdown"] {
  if (Array.isArray(payload.criteria)) return payload.criteria;
  if (Array.isArray(payload.breakdown)) return payload.breakdown;
  if (payload.breakdown && typeof payload.breakdown === "object") {
    return Object.entries(payload.breakdown).map(([key, value]) => ({
      key,
      ...(value as object),
    }));
  }
  return [];
}

export const ToolsEditorial_APIs = {
  standardsCheck: async (data: {
    content: string;
    title?: string;
  }): Promise<StandaloneStandardsResult> => {
    const response = await API.post<
      ApiResponse<
        StandaloneStandardsResult & {
          criteria?: StandaloneStandardsResult["breakdown"];
        }
      >
    >("/api/tools/standards-check", data);
    const payload = getApiData(response);
    return {
      total_score: payload.total_score,
      fusha_passed: payload.fusha_passed,
      breakdown: normalizeStandardsBreakdown(payload),
    };
  },

  credibilityCheck: async (data: { content: string }) => {
    const response = await API.post<ApiResponse<StandaloneCredibilityResult>>(
      "/api/tools/credibility",
      data,
    );
    return getApiData(response);
  },

  localization: async (data: { content: string }) => {
    const response = await API.post<ApiResponse<StandaloneLocalizationResult>>(
      "/api/tools/localization",
      data,
    );
    return getApiData(response);
  },
};
