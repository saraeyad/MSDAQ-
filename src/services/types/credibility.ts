import type {
  ClaimVerdict,
  CredibilityCheckResult,
  CredibilityClaim,
} from "@/types/credibility";
import type { ApiResponse } from "./api";

export type ApiCredibilityClaim = {
  text: string;
  verdict: ClaimVerdict;
  explanation: string;
};

export type ApiCredibilityCheckData = {
  credibility_score: number;
  total_claims: number;
  claims: ApiCredibilityClaim[];
};

export type CredibilityCheckResponse = ApiResponse<ApiCredibilityCheckData>;

function mapClaim(claim: ApiCredibilityClaim): CredibilityClaim {
  return {
    text: claim.text,
    verdict: claim.verdict,
    explanation: claim.explanation,
  };
}

export function mapCredibilityCheckResult(
  data: ApiCredibilityCheckData,
): CredibilityCheckResult {
  return {
    credibilityScore: data.credibility_score,
    totalClaims: data.total_claims,
    claims: data.claims.map(mapClaim),
  };
}
