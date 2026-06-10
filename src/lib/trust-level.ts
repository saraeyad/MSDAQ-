export type TrustLevel = "high" | "medium" | "low";

export function getTrustLevel(score: number): TrustLevel {
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export const TRUST_STROKE_CLASS: Record<TrustLevel, string> = {
  high: "stroke-trust-high",
  medium: "stroke-trust-medium",
  low: "stroke-trust-low",
};

export const TRUST_TEXT_CLASS: Record<TrustLevel, string> = {
  high: "text-trust-high",
  medium: "text-trust-medium",
  low: "text-trust-low",
};

export const TRUST_BADGE_CLASS: Record<TrustLevel, string> = {
  high: "trust-badge-high",
  medium: "trust-badge-medium",
  low: "trust-badge-low",
};
