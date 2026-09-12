import type {
  StandardsCriterion,
  StandardsSpan,
  StandardsSpanSeverity,
} from "@/types";

export const CRITERIA_WITH_SPANS = [
  "headline_neutral",
  "claims_sourced",
  "no_bias",
  "opinion_separated",
  "no_discrimination",
] as const;

export type CriteriaWithSpansKey = (typeof CRITERIA_WITH_SPANS)[number];

type StandardsCriterionLike = {
  key?: string;
  label?: string;
  score?: number | null;
  passed?: boolean | null;
  max?: number | null;
  feedback?: string;
  spans?: StandardsSpan[];
};

type StandardsPayload = {
  criteria?: StandardsCriterionLike[];
  breakdown?:
    | StandardsCriterionLike[]
    | Record<string, Omit<StandardsCriterionLike, "key">>;
  fusha_passed?: boolean;
  total_score?: number;
  max_score?: number;
};

function normalizeSpan(raw: unknown): StandardsSpan | null {
  if (!raw || typeof raw !== "object") return null;
  const span = raw as Record<string, unknown>;
  const quote = typeof span.quote === "string" ? span.quote : "";
  const reason = typeof span.reason === "string" ? span.reason : "";
  const severity = span.severity;
  if (
    !quote ||
    (severity !== "low" && severity !== "medium" && severity !== "high")
  ) {
    return null;
  }
  return { quote, reason, severity };
}

function normalizeCriterion(raw: StandardsCriterionLike): StandardsCriterion {
  const spans = Array.isArray(raw.spans)
    ? raw.spans
        .map(normalizeSpan)
        .filter((span): span is StandardsSpan => span !== null)
    : undefined;

  return {
    key: raw.key ?? "",
    label: raw.label ?? raw.key ?? "",
    score: raw.score ?? null,
    passed: raw.passed ?? null,
    max: raw.max ?? null,
    feedback: raw.feedback ?? "",
    spans: spans?.length ? spans : undefined,
  };
}

/** Normalize article or standalone standards API shapes to a criteria array. */
export function normalizeStandardsCriteria(
  payload: StandardsPayload,
): StandardsCriterion[] {
  if (Array.isArray(payload.criteria)) {
    return payload.criteria.map(normalizeCriterion);
  }
  if (Array.isArray(payload.breakdown)) {
    return payload.breakdown.map(normalizeCriterion);
  }
  if (payload.breakdown && typeof payload.breakdown === "object") {
    return Object.entries(payload.breakdown).map(([key, value]) =>
      normalizeCriterion({ key, ...(value as StandardsCriterionLike) }),
    );
  }
  return [];
}

export function isFushaCriterion(criterion: StandardsCriterion): boolean {
  return criterion.key === "fusha_language";
}

export function isScoredCriterion(criterion: StandardsCriterion): boolean {
  return criterion.score != null && criterion.max != null;
}

export function severityRank(severity: StandardsSpanSeverity): number {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

export function severityLabel(severity: StandardsSpanSeverity): string {
  if (severity === "high") return "مرتفع";
  if (severity === "medium") return "متوسط";
  return "منخفض";
}

/** Normalize full standards check payload to unified result shape. */
export function normalizeStandardsResult(payload: StandardsPayload) {
  const criteria = normalizeStandardsCriteria(payload);
  return {
    fusha_passed: payload.fusha_passed ?? false,
    total_score: payload.total_score ?? 0,
    max_score: payload.max_score ?? 140,
    criteria,
  };
}
