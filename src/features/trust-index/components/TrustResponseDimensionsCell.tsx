import { cn } from "@/lib/utils";
import { TRUST_DIMENSIONS } from "@/lib/trust-index-labels";
import type { TrustIndexResponseRow } from "@/types";

interface TrustResponseDimensionsCellProps {
  scores: TrustIndexResponseRow["scores"];
}

function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 4) return "high";
  if (score === 3) return "mid";
  return "low";
}

export function TrustResponseDimensionsCell({
  scores,
}: TrustResponseDimensionsCellProps) {
  return (
    <div className="trust-response-dimensions">
      {TRUST_DIMENSIONS.map(({ key, label }) => {
        const score = scores[key];

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
