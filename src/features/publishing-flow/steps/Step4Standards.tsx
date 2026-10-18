import { Button } from "@/components/ui/button";
import { AiCheckProcessingDialog } from "@/features/publishing-flow/components/AiCheckProcessingDialog";
import { AiCheckStatusBanner } from "@/features/publishing-flow/components/AiCheckStatusBanner";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { runWithToolProcessing } from "@/features/tools/components/ToolProcessingDialog";
import { StandardsHighlightedText } from "@/features/tools/components/StandardsHighlightedText";
import { StandardsResultCard } from "@/features/tools/components/StandardsResultCard";
import { useArticleAiCheck } from "@/hooks/publishing/useArticleAiCheck";
import { getApiErrorMessage } from "@/lib/api";
import { getStandardsCheckErrorMessage } from "@/lib/publishing";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Step4StandardsProps {
  articleId: number | string;
  title?: string;
  contentFormal?: string | null;
  /** From article.gate — true when a standards run was saved before. */
  previouslyChecked?: boolean;
  onComplete: () => void;
  onBack?: () => void;
}

export function Step4Standards({
  articleId,
  title = "",
  contentFormal = "",
  previouslyChecked = false,
  onComplete,
  onBack,
}: Step4StandardsProps) {
  const {
    check,
    result,
    loadingInitial,
    loadingHistory,
    startCheck,
    refreshLatest,
    loadError,
  } = useArticleAiCheck(articleId, "standards");
  const [processing, setProcessing] = useState(false);
  const [showSaved, setShowSaved] = useState(true);
  const body = contentFormal ?? "";

  const busy = processing || loadingHistory;
  const hasSavedResult = result != null;

  const runCheck = async () => {
    try {
      await runWithToolProcessing(setProcessing, async () => {
        await startCheck();
      });
      setShowSaved(true);
    } catch (err) {
      toast.error(getStandardsCheckErrorMessage(err));
    }
  };

  const showPreviousResult = async () => {
    if (busy) return;
    if (hasSavedResult && showSaved) {
      setShowSaved(false);
      return;
    }
    setShowSaved(true);
    if (hasSavedResult) return;
    try {
      const latest = await refreshLatest();
      if (!latest || latest.status !== "done" || !latest.result) {
        toast.message("لا توجد نتيجة معايير محفوظة لهذا المقال بعد.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
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

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void runCheck()} disabled={busy}>
          {hasSavedResult ? "إعادة تشغيل فحص المعايير" : "تشغيل فحص المعايير"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void showPreviousResult()}
          disabled={busy}
        >
          {loadingHistory ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              جاري الجلب…
            </>
          ) : hasSavedResult && showSaved ? (
            "إخفاء نتيجة الفحص السابق"
          ) : (
            "عرض نتيجة الفحص السابق"
          )}
        </Button>
      </div>

      {loadError ? (
        <p className="text-sm text-destructive" role="alert">
          تعذر تحميل نتيجة الفحص المحفوظة: {loadError}
        </p>
      ) : null}

      <AiCheckStatusBanner
        check={check}
        inProgressLabel="جاري فحص المعايير…"
      />

      {hasSavedResult && showSaved ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">نتيجة فحص المعايير المحفوظة</h4>
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
        </div>
      ) : null}

      {!hasSavedResult && previouslyChecked && !loadError ? (
        <p className="text-sm text-muted-foreground">
          هذا المقال فُحص من قبل. اضغط «عرض نتيجة الفحص السابق» لجلبها من السجل.
        </p>
      ) : null}

      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} />
      </StepActionsRow>
    </div>
  );
}
