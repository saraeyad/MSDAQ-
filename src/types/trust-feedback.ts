export type TrustBand = "low" | "medium" | "high";

export interface TrustIndexSubmitPayload {
  accuracy_score: number;
  credibility_score: number;
  objectivity_score: number;
  transparency_score: number;
  comment?: string;
}

export interface TrustDimensionSummary {
  average: number | null;
  distribution: [number, number, number, number, number];
}

export interface TrustIndexSummary {
  count: number;
  overall: {
    average: number | null;
    percentage: number | null;
    band: TrustBand | null;
  };
  dimensions: {
    accuracy: TrustDimensionSummary;
    credibility: TrustDimensionSummary;
    objectivity: TrustDimensionSummary;
    transparency: TrustDimensionSummary;
    consistency?: TrustDimensionSummary;
  };
  band_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface TrustIndexResponseRow {
  id: number;
  created_at: string;
  scores: {
    accuracy: number;
    credibility: number;
    objectivity: number;
    transparency: number;
    consistency?: number;
  };
  overall_score: number;
  trust_percentage: number;
  trust_level: TrustBand;
  comment: string | null;
}

export interface TrustIndexListParams {
  page?: number;
  per_page?: number;
  start?: string;
  end?: string;
}

export interface TrustIndexPlatformSummaryParams extends TrustIndexListParams {
  categories?: number[];
}

export interface PlatformFeedbackSubmitPayload {
  accuracy_score: number;
  credibility_score: number;
  objectivity_score: number;
  transparency_score: number;
  consistency_score: number;
  comment?: string;
}

export interface PlatformFeedbackListParams {
  page?: number;
  per_page?: number;
  start?: string;
  end?: string;
}

/** Backend default page size for trust-index responses and platform feedback. */
export const TRUST_FEEDBACK_PAGE_SIZE = 20;

/** Article trust responses table page size. */
export const ARTICLE_TRUST_RESPONSES_PAGE_SIZE = 5;
