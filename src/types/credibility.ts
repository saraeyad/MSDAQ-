export type ClaimVerdict = "verified" | "unverified" | "false" | "disputed";

export type CredibilityClaim = {
  text: string;
  verdict: ClaimVerdict;
  explanation: string;
};

export type CredibilityCheckResult = {
  credibilityScore: number;
  totalClaims: number;
  claims: CredibilityClaim[];
};
