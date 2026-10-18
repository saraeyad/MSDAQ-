import { Button } from "@/components/ui/button";
import { AiCheckProcessingDialog } from "@/features/publishing-flow/components/AiCheckProcessingDialog";
import { AiCheckStatusBanner } from "@/features/publishing-flow/components/AiCheckStatusBanner";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { runWithToolProcessing } from "@/features/tools/components/ToolProcessingDialog";
import { StandardsHighlightedText } from "@/features/tools/components/StandardsHighlightedText";
import { StandardsResultCard } from "@/features/tools/components/StandardsResultCard";
import { useArticleAiCheck } from "@/hooks/publishing/useArticleAiCheck";
import { getStandardsCheckErrorMessage } from "@/lib/publishing";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Step4StandardsProps {
  articleId: number | string;
  title?: string;
  contentFormal?: string | null;
  onComplete: () => void;
  onBack?: () => void;
}

export function Step4Standards({
  articleId,
  title = "",
  contentFormal = "",
  onComplete,
  onBack,
}: Step4StandardsProps) {
  const { check, result, loadingInitial, startCheck } = useArticleAiCheck(
    articleId,
    "standards",
  );
  const [processing, setProcessing] = useState(false);
  const body = contentFormal ?? "";

  const runCheck = async () => {
    try {
      await runWithToolProcessing(setProcessing, async () => {
        await startCheck();
      });
    } catch (err) {
      toast.error(getStandardsCheckErrorMessage(err));
    }
  };

  if (loadingInitial) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جاري تحميل نتيجة فحص المعايير المحفوظة…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <AiCheckProcessingDialog open={processing} type="standards" />

      <p className="text-muted-foreground">
        فحص المعايير إرشادي — يمكنك المتابعة والنشر حتى إن لم يُجتز الفحص.
      </p>
      <Button onClick={() => void runCheck()} disabled={processing}>
        {result ? "إعادة تشغيل فحص المعايير" : "تشغيل فحص المعايير"}
      </Button>

      <AiCheckStatusBanner
        check={check}
        inProgressLabel="جاري فحص المعايير…"
      />

      {result ? (
        <>
          <StandardsResultCard
            result={result}
            title={title}
            content={body}
          />
          <StandardsHighlightedText
            title={title}
            content={body}
            criteria={result.criteria}
          />
        </>
      ) : null}

      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} />
      </StepActionsRow>
    </div>
  );
}
