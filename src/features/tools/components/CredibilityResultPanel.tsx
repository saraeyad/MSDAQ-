import { ScoreDonut } from "@/features/tools/components/ScoreDonut";
import {
  credibilityVerdictClass,
  credibilityVerdictLabel,
} from "@/lib/publishing";
import type { CredibilityCheckResult } from "@/types";

export function CredibilityResultPanel({
  result,
}: {
  result: CredibilityCheckResult;
}) {
  return (
    <div className="space-y-4">
      <div className="score-donut-row score-donut-row--center">
        <ScoreDonut
          value={result.credibility_score}
          max={100}
          label="درجة المصداقية"
          caption={`${result.total_claims} ادعاءات`}
          size="md"
        />
      </div>
      <ul className="space-y-3">
        {result.claims.map((claim) => (
          <li
            key={claim.text}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <span
              className={`credibility-verdict ${credibilityVerdictClass(claim.verdict)}`}
            >
              {credibilityVerdictLabel(claim.verdict)}
            </span>
            <p className="mt-2 text-sm font-medium leading-relaxed">{claim.text}</p>
            {claim.explanation ? (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {claim.explanation}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
