import type { TrustBand, TrustIndexSummary } from "@/types";

export const TRUST_DIMENSIONS = [
  { key: "accuracy", label: "الدقة", question: "المعلومات في هذا المقال كانت دقيقة" },
  {
    key: "credibility",
    label: "المصداقية",
    question: "أثق في المصدر الذي استند إليه هذا المحتوى",
  },
  {
    key: "objectivity",
    label: "الموضوعية",
    question: "شعرت أن المقال عرض الموضوع بحياد دون تحيز",
  },
  {
    key: "transparency",
    label: "الشفافية",
    question: "كان واضحاً من أين جاءت المعلومات (مصادر، بيانات، شهادات)",
  },
] as const;

export const PLATFORM_TRUST_DIMENSIONS = [
  {
    key: "accuracy",
    label: "الدقة",
    question: "بشكل عام، المعلومات التي تنشرها هذه المنصة دقيقة وموثوقة",
  },
  {
    key: "credibility",
    label: "المصداقية",
    question: "أثق في هذه المنصة كمصدر إعلامي موثوق",
  },
  {
    key: "objectivity",
    label: "الموضوعية",
    question: "تعرض المنصة القضايا المختلفة بحياد وتوازن دون تحيز",
  },
  {
    key: "transparency",
    label: "الشفافية",
    question: "تُبيّن المنصة بوضوح مصادر معلوماتها وطريقة عملها",
  },
  {
    key: "consistency",
    label: "الاتساق",
    question: "جودة المحتوى على المنصة ثابتة ولا تتفاوت بشكل كبير بمرور الوقت",
  },
] as const;

export type TrustDimensionDefinition =
  | (typeof TRUST_DIMENSIONS)[number]
  | (typeof PLATFORM_TRUST_DIMENSIONS)[number];

export const TRUST_BAND_LABELS: Record<TrustBand, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

export function trustBandLabel(band: TrustBand | null | undefined): string {
  if (!band) return "—";
  return TRUST_BAND_LABELS[band];
}

export function trustBandClass(band: TrustBand | null | undefined): string {
  if (band === "high") return "trust-band--high";
  if (band === "medium") return "trust-band--medium";
  if (band === "low") return "trust-band--low";
  return "trust-band--empty";
}

export function formatTrustPercentage(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value)}%`;
}

export function formatTrustAverage(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function trustIndexHasData(summary: TrustIndexSummary | undefined): boolean {
  return (summary?.count ?? 0) > 0;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function trustReadingThresholdSeconds(wordCount: number): number {
  const readingSeconds = (wordCount / 180) * 60 * 0.75;
  return Math.max(45, Math.round(readingSeconds));
}

/** Tab is visible and focused — per Trust Index §1.4 (Page Visibility API). */
export function isTrustIndexTabActive(): boolean {
  if (typeof document === "undefined") return false;
  return document.visibilityState === "visible" && document.hasFocus();
}

export const TRUST_MEDIA_MIN_PLAY_SECONDS = 45;
export const TRUST_MEDIA_DURATION_RATIO = 0.75;

export interface TrustMediaProgress {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  ended?: boolean;
}

export function trustMediaThresholdReached(progress: {
  playedSeconds: number;
  currentTime: number;
  duration: number;
  ended?: boolean;
}): boolean {
  if (progress.ended) return true;
  if (progress.playedSeconds >= TRUST_MEDIA_MIN_PLAY_SECONDS) return true;
  if (
    progress.duration > 0 &&
    progress.currentTime / progress.duration >= TRUST_MEDIA_DURATION_RATIO
  ) {
    return true;
  }
  return false;
}

function firstFiniteNumber(
  ...values: Array<number | string | null | undefined>
): number | null {
  for (const value of values) {
    if (value == null || value === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function articleReviewThresholds(article: {
  review_target?: number | null;
  reviewTarget?: number | null;
  target?: number | null;
  review_limit?: number | null;
  reviewLimit?: number | null;
  maxReviewsCount?: number | null;
  max_reviews_count?: number | null;
}): { target: number | null; max: number | null } {
  return {
    target: firstFiniteNumber(
      article.review_target,
      article.reviewTarget,
      article.target,
    ),
    max: firstFiniteNumber(
      article.maxReviewsCount,
      article.max_reviews_count,
      article.reviewLimit,
      article.review_limit,
    ),
  };
}

export function articleAcceptsPublicReviews(article: {
  hasReachedLimit?: boolean | null;
  has_reached_review_limit?: boolean | null;
}): boolean {
  return article.hasReachedLimit !== true && article.has_reached_review_limit !== true;
}

export function trustIndexDismissKey(articleId: number | string): string {
  return `trust-index-dismissed:${String(articleId)}`;
}

/** Per-article auto-popup suppression for this browser tab/session. */
export function isTrustIndexDismissed(articleId: number | string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(trustIndexDismissKey(articleId)) === "1";
}

export function markTrustIndexDismissed(articleId: number | string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(trustIndexDismissKey(articleId), "1");
}
