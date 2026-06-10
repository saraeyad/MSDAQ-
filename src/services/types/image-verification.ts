import type {
  AiDetectionResult,
  AiImageVerdict,
  ImageAppearance,
  ImageVerificationResult,
} from "@/types/image-verification";
import type { ApiResponse } from "./api";

export type ApiImageAppearance = {
  title: string;
  link: string;
  domain: string;
  logo: string;
  image: string;
  date: string;
};

export type ApiImageVerificationData = {
  image_url: string;
  appearances: ApiImageAppearance[];
};

export type ImageVerificationResponse = ApiResponse<ApiImageVerificationData>;

export type ApiAiDetectionData = {
  likely_ai_generated: boolean;
  confidence_score: number;
  status: string;
  verdict: AiImageVerdict;
};

export type AiDetectionResponse = ApiResponse<ApiAiDetectionData>;

function mapAppearance(appearance: ApiImageAppearance): ImageAppearance {
  return {
    title: appearance.title,
    link: appearance.link,
    domain: appearance.domain,
    logo: appearance.logo,
    image: appearance.image,
    date: appearance.date,
  };
}

export function mapImageVerificationResult(
  data: ApiImageVerificationData,
): ImageVerificationResult {
  return {
    imageUrl: data.image_url,
    appearances: (data.appearances ?? []).map(mapAppearance),
  };
}

export function mapAiDetectionResult(data: ApiAiDetectionData): AiDetectionResult {
  return {
    likelyAiGenerated: data.likely_ai_generated,
    confidenceScore: data.confidence_score,
    status: data.status,
    verdict: data.verdict,
  };
}
