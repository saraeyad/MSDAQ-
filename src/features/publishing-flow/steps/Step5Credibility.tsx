import { Button } from "@/components/ui/button";
import { SourceConsentBanner } from "@/features/publishing-flow/components/SourceConsentBanner";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { CredibilityResultPanel } from "@/features/tools/components/CredibilityResultPanel";
import {
  runWithToolProcessing,
  ToolProcessingDialog,
} from "@/features/tools/components/ToolProcessingDialog";
import { getApiErrorMessage } from "@/lib/api";
import { CREDIBILITY_PROCESSING_STEPS } from "@/lib/publishing";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type { ArticleSource, CredibilityCheckResult } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface Step5CredibilityProps {
  articleId: number | string;
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
  const [result, setResult] = useState<CredibilityCheckResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const runCheck = async () => {
    if (!articleId) return;
    try {
      await runWithToolProcessing(setProcessing, async () => {
        const check = await ArticlesStaff_APIs.credibilityCheck(articleId);
        setResult(check);
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
        className="publish-flow-processing"
      />
      <SourceConsentBanner sources={sources} />
      <p className="text-muted-foreground">
        فحص المصداقية إرشادي — يمكنك المتابعة والنشر حتى إن لم يُجتز الفحص.
      </p>
      <Button onClick={() => void runCheck()} disabled={processing}>
        تشغيل فحص المصداقية
      </Button>
      {result ? <CredibilityResultPanel result={result} /> : null}
      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} />
      </StepActionsRow>
    </div>
  );
}
