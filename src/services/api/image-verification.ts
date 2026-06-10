import type { AiDetectionResult, ImageVerificationResult } from "@/types/image-verification";
import API from "./api.repository";
import type { ApiResponse } from "../types/api";
import {
  mapAiDetectionResult,
  mapImageVerificationResult,
  type AiDetectionResponse,
  type ImageVerificationResponse,
} from "../types/image-verification";

export type ImageVerificationPayload = {
  image_url: string;
};

const ImageVerification_APIs = {
  reverseSearch: async (payload: ImageVerificationPayload) => {
    const response = await API.post<ImageVerificationResponse>(
      "/api/image-verification/reverse-search",
      payload,
    );

    const result = response.data.data
      ? mapImageVerificationResult(response.data.data)
      : null;

    return {
      data: {
        error: response.data.error || !result,
        message: response.data.message,
        data: result,
      } satisfies ApiResponse<ImageVerificationResult>,
    };
  },

  detectAi: async (file: File) => {
    const formData = new FormData();
    formData.append("image_file", file);

    const response = await API.postFormData<AiDetectionResponse>(
      "/api/image-verification/ai-detection",
      formData,
    );

    const result = response.data.data
      ? mapAiDetectionResult(response.data.data)
      : null;

    return {
      data: {
        error: response.data.error || !result,
        message: response.data.message,
        data: result,
      } satisfies ApiResponse<AiDetectionResult>,
    };
  },
};

export default ImageVerification_APIs;
