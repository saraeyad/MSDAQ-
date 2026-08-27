import { cn } from "@/lib/utils";
import {
  TRUST_DIMENSIONS,
  type TrustDimensionDefinition,
} from "@/lib/trust-index-labels";
import type { TrustIndexResponseRow } from "@/types";

interface TrustResponseDimensionsCellProps {
  scores: TrustIndexResponseRow["scores"];
  dimensions?: readonly TrustDimensionDefinition[];
}

function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 4) return "high";
  if (score === 3) return "mid";
  return "low";
}

export function TrustResponseDimensionsCell({
  scores,
  dimensions = TRUST_DIMENSIONS,
}: TrustResponseDimensionsCellProps) {
  return (
    <div className="trust-response-dimensions">
      {dimensions.map(({ key, label }) => {
        const score = scores[key as keyof typeof scores];
        if (score == null) return null;

        return (
          <span
            key={key}
            className={cn(
              "trust-response-dimensions__chip",
              `trust-response-dimensions__chip--${scoreTone(score)}`,
            )}
            title={`${label}: ${score} من 5`}
          >
            <span className="trust-response-dimensions__chip-label">{label}</span>
            <span className="trust-response-dimensions__chip-score">{score}/5</span>
          </span>
        );
      })}
    </div>
  );
}
