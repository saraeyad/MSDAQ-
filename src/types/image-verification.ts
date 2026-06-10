export type ImageAppearance = {
  title: string;
  link: string;
  domain: string;
  logo: string;
  image: string;
  date: string;
};

export type ImageVerificationResult = {
  imageUrl: string;
  appearances: ImageAppearance[];
};

export type DomainGroup = {
  domain: string;
  logo: string;
  count: number;
};

export type AiImageVerdict = "ai_generated" | "likely_real" | "uncertain";

export type AiDetectionResult = {
  likelyAiGenerated: boolean;
  confidenceScore: number;
  status: string;
  verdict: AiImageVerdict;
};

export type ImageVerificationMode = "reverse" | "ai";
