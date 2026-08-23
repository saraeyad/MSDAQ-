import { getApiData } from "@/lib/api-data";
import { extractPublicMediaUrl } from "@/lib/media-url";
import { Library_APIs } from "@/services/api/library";
import type { AiDetectionResult, ApiResponse, ReverseSearchMatch } from "@/types";
import type { AxiosRequestConfig } from "axios";
import API from "./api.repository";

type UploadProgressOptions = Pick<AxiosRequestConfig, "onUploadProgress">;

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

function recordId(payload: unknown): number | null {
  if (!payload || typeof payload !== "object" || !("id" in payload)) return null;
  const id = Number((payload as { id?: unknown }).id);
  return Number.isFinite(id) ? id : null;
}

export const ImageVerification_APIs = {
  /**
   * Temporarily host a local image so reverse search can use a public URL.
   * Caller should delete the library item after the search finishes.
   */
  uploadPublicImage: async (
    file: File,
    options?: UploadProgressOptions,
  ): Promise<{ url: string; libraryId: number | null }> => {
    const formData = new FormData();
    formData.append("title", `بحث عكسي — ${file.name}`);
    formData.append("file", file);

    const response = await API.postFormData<ApiResponse<unknown>>(
      "/api/library",
      formData,
      options,
    );
    const data = getApiData(response);
    let publicUrl =
      extractPublicMediaUrl(data) ?? extractPublicMediaUrl(response.data);
    let libraryId = recordId(data);

    if (libraryId && !publicUrl) {
      const item = await Library_APIs.get(libraryId);
      publicUrl = extractPublicMediaUrl(item);
      libraryId = recordId(item) ?? libraryId;
    }

    if (!publicUrl) {
      throw new Error("تعذّر الحصول على رابط عام للصورة بعد الرفع");
    }

    return { url: publicUrl, libraryId };
  },

  discardTempImage: async (libraryId: number | null) => {
    if (!libraryId) return;
    try {
      await Library_APIs.delete(libraryId);
    } catch {
      // Temp hosting only — don't block search/UI if cleanup fails.
    }
  },

  /** Reverse search accepts a public https URL only — same contract as publishing. */
  reverseSearch: async (imageUrl: string) => {
    const url = imageUrl.trim();
    if (!url) {
      throw new Error("أدخل رابط صورة عام");
    }

    const response = await API.post<
      ApiResponse<ReverseSearchMatch[] | { results?: ReverseSearchMatch[] }>
    >("/api/tools/reverse-search", { image_url: url });
    return unwrapReverseSearchMatches(getApiData(response));
  },

  aiDetection: async (
    input: { file?: File; imageUrl?: string },
    options?: UploadProgressOptions,
  ) => {
    const formData = new FormData();
    if (input.file) formData.append("image_file", input.file);
    else if (input.imageUrl) formData.append("image_url", input.imageUrl);
    const response = await API.postFormData<ApiResponse<AiDetectionResult>>(
      "/api/tools/ai-detect",
      formData,
      options,
    );
    return getApiData(response);
  },
};
