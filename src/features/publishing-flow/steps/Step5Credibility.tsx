import { Button } from "@/components/ui/button";
import { AiCheckProcessingDialog } from "@/features/publishing-flow/components/AiCheckProcessingDialog";
import { AiCheckStatusBanner } from "@/features/publishing-flow/components/AiCheckStatusBanner";
import { SourceConsentBanner } from "@/features/publishing-flow/components/SourceConsentBanner";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { CredibilityResultPanel } from "@/features/tools/components/CredibilityResultPanel";
import { useArticleAiCheck } from "@/hooks/publishing/useArticleAiCheck";
import { getApiErrorMessage } from "@/lib/api";
import type { ArticleSource } from "@/types";
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
  const {
    check,
    result,
    starting,
    isPolling,
    startCheck,
  } = useArticleAiCheck(articleId, "credibility");
  const [submitting, setSubmitting] = useState(false);

  const busy = starting || isPolling || submitting;

  const runCheck = async () => {
    if (!articleId || busy) return;
    setSubmitting(true);
    try {
      await startCheck();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const showProcessingModal = starting || isPolling;

  return (
    <div className="space-y-4">
      <AiCheckProcessingDialog open={showProcessingModal} type="credibility" />
      <SourceConsentBanner sources={sources} />
      <p className="text-muted-foreground">
        فحص المصداقية إرشادي — يمكنك المتابعة والنشر حتى إن لم يُجتز الفحص.
      </p>
      <Button onClick={() => void runCheck()} disabled={busy}>
        تشغيل فحص المصداقية
      </Button>
      {check?.status === "failed" ? (
        <AiCheckStatusBanner check={check} />
      ) : null}
      {result ? <CredibilityResultPanel result={result} /> : null}
      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} />
      </StepActionsRow>
    </div>
  );
}
