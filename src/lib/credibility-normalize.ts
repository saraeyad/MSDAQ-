import type { CredibilityCheckResult, CredibilityClaim } from "@/types";

type CredibilityPayload = {
  credibility_score?: number | string | null;
  overall_score?: number | string | null;
  score?: number | string | null;
  total_claims?: number | string | null;
  claims?: unknown;
};

function normalizeClaim(raw: unknown): CredibilityClaim | null {
  if (!raw || typeof raw !== "object") return null;
  const claim = raw as Record<string, unknown>;
  const text = typeof claim.text === "string" ? claim.text.trim() : "";
  if (!text) return null;
  const verdict =
    typeof claim.verdict === "string" && claim.verdict.trim()
      ? claim.verdict.trim()
      : "unverified";
  const explanation =
    typeof claim.explanation === "string" ? claim.explanation.trim() : "";
  return { text, verdict, explanation };
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Normalize article or standalone credibility API payloads. */
export function normalizeCredibilityResult(
  payload: CredibilityPayload,
): CredibilityCheckResult {
  const claims = Array.isArray(payload.claims)
    ? payload.claims
        .map(normalizeClaim)
        .filter((claim): claim is CredibilityClaim => claim !== null)
    : [];

  return {
    credibility_score: toNumber(
      payload.credibility_score ?? payload.overall_score ?? payload.score,
    ),
    total_claims: toNumber(payload.total_claims ?? claims.length),
    claims,
  };
}

export function credibilityVerdictLabel(verdict: string): string {
  switch (verdict) {
    case "verified":
      return "مؤكد";
    case "unverified":
      return "غير مؤكد";
    case "false":
      return "غير دقيق";
    case "disputed":
      return "متنازع عليه";
    default:
      return verdict;
  }
}

export function credibilityVerdictClass(verdict: string): string {
  switch (verdict) {
    case "verified":
      return "credibility-verdict--verified";
    case "false":
      return "credibility-verdict--false";
    case "disputed":
      return "credibility-verdict--disputed";
    default:
      return "credibility-verdict--unverified";
  }
}
