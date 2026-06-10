import { getTrustLevel, TRUST_BADGE_CLASS } from "@/lib/trust-level";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  score: number;
  label: string;
  className?: string;
}

export default function TrustBadge({ score, label, className }: TrustBadgeProps) {
  const level = getTrustLevel(score);

  return (
    <span className={cn("trust-badge", TRUST_BADGE_CLASS[level], className)}>
      <span className="trust-badge-dot" aria-hidden />
      <span className="trust-badge-label">{label}</span>
      <span className="trust-badge-separator" aria-hidden>
        :
      </span>
      <span className="trust-badge-score">{score}</span>
    </span>
  );
}
