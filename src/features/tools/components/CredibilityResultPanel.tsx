import { Card, CardContent } from "@/components/ui/card";
import { ScoreDonut } from "@/features/tools/components/ScoreDonut";
import {
  credibilityVerdictClass,
  credibilityVerdictLabel,
} from "@/lib/credibility-normalize";
import type { CredibilityCheckResult } from "@/types";

interface CredibilityResultPanelProps {
  result: CredibilityCheckResult;
}

export function CredibilityResultPanel({ result }: CredibilityResultPanelProps) {
  const claims = result.claims ?? [];
  const claimCount = result.total_claims ?? claims.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <ScoreDonut
            value={result.credibility_score}
            max={100}
            format="percent"
            size="md"
            label="درجة المصداقية"
            caption={
              claimCount > 0
                ? `${claimCount} ادعاء — للمراجعة فقط`
                : "للمراجعة فقط"
            }
          />
        </CardContent>
      </Card>

      {claims.length > 0 ? (
        <div className="space-y-2">
          {claims.map((claim, index) => (
            <Card key={`${claim.text}-${index}`}>
              <CardContent className="space-y-2 p-4 text-sm">
                <p className="font-medium leading-relaxed">{claim.text}</p>
                <span
                  className={`credibility-verdict ${credibilityVerdictClass(claim.verdict)}`}
                >
                  {credibilityVerdictLabel(claim.verdict)}
                </span>
                {claim.explanation ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {claim.explanation}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
