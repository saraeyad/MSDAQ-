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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Step5CredibilityProps {
  articleId: number | string;
  sources: ArticleSource[];
  /** From article.gate — true when a credibility run was saved before. */
  previouslyChecked?: boolean;
  onComplete: () => void;
  onBack?: () => void;
}

export function Step5Credibility({
  articleId,
  sources,
  previouslyChecked = false,
  onComplete,
  onBack,
}: Step5CredibilityProps) {
  const {
    check,
    result,
    loadingInitial,
    loadingHistory,
    starting,
    isPolling,
    loadError,
    startCheck,
    refreshLatest,
  } = useArticleAiCheck(articleId, "credibility");
  const [submitting, setSubmitting] = useState(false);
  const [showSaved, setShowSaved] = useState(true);

  const busy = starting || isPolling || submitting || loadingHistory;
  const hasSavedResult = result != null;

  const runCheck = async () => {
    if (!articleId || busy) return;
    setSubmitting(true);
    try {
      await startCheck();
      setShowSaved(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
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
        toast.message("لا توجد نتيجة مصداقية محفوظة لهذا المقال بعد.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const showProcessingModal = starting || isPolling;

  if (loadingInitial) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جاري تحميل نتيجة فحص المصداقية المحفوظة…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <AiCheckProcessingDialog open={showProcessingModal} type="credibility" />
      <SourceConsentBanner sources={sources} />
      <p className="text-muted-foreground">
        فحص المصداقية إرشادي — يمكنك المتابعة والنشر حتى إن لم يُجتز الفحص.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void runCheck()} disabled={busy}>
          {hasSavedResult ? "إعادة تشغيل فحص المصداقية" : "تشغيل فحص المصداقية"}
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

      {check?.status === "failed" ? (
        <AiCheckStatusBanner check={check} />
      ) : null}

      {hasSavedResult && showSaved ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">نتيجة فحص المصداقية المحفوظة</h4>
          <CredibilityResultPanel result={result} />
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
