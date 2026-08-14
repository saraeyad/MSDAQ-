import { SourceConsentBanner } from "@/features/publishing-flow/components/SourceConsentBanner";
import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Card, CardContent } from "@/components/ui/card";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api-data";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type { ArticleSource, CredibilityCheckResult } from "@/types";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ScoreDonut } from "@/features/tools/components/ScoreDonut";
import { CREDIBILITY_PROCESSING_STEPS } from "@/lib/tool-processing-steps";

interface Step5CredibilityProps {
  articleId: number;
  sources: ArticleSource[];
  onComplete: () => void;
  onBack?: () => void;
}

export function Step5Credibility({
  articleId,
  sources,
  onComplete,
  onBack,
}: Step5CredibilityProps) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CredibilityCheckResult | null>(null);

  const runCheck = async () => {
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const data = await ArticlesStaff_APIs.credibilityCheck(articleId);
        setResult(data);
        await queryClient.invalidateQueries({
          queryKey: ["staff-article", String(articleId)],
        });
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <ToolProcessingDialog
        open={processing}
        title="جاري فحص المصداقية"
        steps={CREDIBILITY_PROCESSING_STEPS}
      />

      <SourceConsentBanner sources={sources} />

      <p className="text-muted-foreground">
        فحص المصداقية إرشادي — يمكنك المتابعة بعد تشغيله بغض النظر عن الدرجة.
      </p>

      <Button onClick={runCheck} disabled={processing}>
        تشغيل فحص المصداقية
      </Button>

      {result && (
        <>
          <Card>
            <CardContent className="p-4">
              <ScoreDonut
                value={result.credibility_score}
                max={100}
                format="percent"
                size="md"
                label="درجة المصداقية"
                caption={`${result.total_claims} ادعاء — للمراجعة فقط`}
              />
            </CardContent>
          </Card>

          <div className="space-y-2">
            {(result.claims ?? []).map((claim, i) => (
              <Card key={i}>
                <CardContent className="space-y-1 p-3 text-sm">
                  <p className="font-medium">{claim.text}</p>
                  <p className="text-primary">{claim.verdict}</p>
                  <p className="text-muted-foreground">{claim.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} />
      </StepActionsRow>
    </div>
  );
}
