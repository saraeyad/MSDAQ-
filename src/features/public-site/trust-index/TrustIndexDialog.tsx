import { OliveBranch } from "@/components/ghazawiya/olive-branch";
import { Button } from "@/components/ui/button";
import { StarRatingInput } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  isPublicFeedbackClosed,
  isPublicFeedbackNotFound,
  isPublicFeedbackRateLimited,
} from "@/lib/public-feedback-errors";
import { TRUST_DIMENSIONS } from "@/lib/trust-index-labels";
import { TrustIndex_APIs } from "@/services/api/trust-index";
import type { TrustIndexSubmitPayload } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface TrustIndexDialogProps {
  articleId: number | string;
  open: boolean;
  onDismiss: () => void;
  onSubmitted?: () => void;
}

const INITIAL_SCORES: TrustIndexSubmitPayload = {
  accuracy_score: 0,
  credibility_score: 0,
  objectivity_score: 0,
  transparency_score: 0,
  comment: "",
};

export function TrustIndexDialog({
  articleId,
  open,
  onDismiss,
  onSubmitted,
}: TrustIndexDialogProps) {
  const titleId = useId();
  const [scores, setScores] = useState(INITIAL_SCORES);

  const submitMutation = useMutation({
    mutationFn: () => {
      const payload: TrustIndexSubmitPayload = {
        accuracy_score: scores.accuracy_score,
        credibility_score: scores.credibility_score,
        objectivity_score: scores.objectivity_score,
        transparency_score: scores.transparency_score,
      };
      const comment = scores.comment?.trim();
      if (comment) payload.comment = comment;
      return TrustIndex_APIs.submitPublic(articleId, payload);
    },
    onSuccess: () => {
      toast.success("شكراً — تم تسجيل تقييمك");
      onSubmitted?.();
      onDismiss();
      setScores(INITIAL_SCORES);
    },
    onError: (error) => {
      if (isPublicFeedbackRateLimited(error)) {
        onDismiss();
        return;
      }
      if (isPublicFeedbackNotFound(error)) {
        toast.error("هذا المقال لم يعد متاحاً");
        onDismiss();
        return;
      }
      if (isPublicFeedbackClosed(error)) {
        toast.error("اكتمل عدد التقييمات لهذا المقال");
        onSubmitted?.();
        onDismiss();
        return;
      }
      toast.error(getApiErrorMessage(error));
    },
  });

  const filledCount = TRUST_DIMENSIONS.filter(
    (dimension) =>
      (scores[`${dimension.key}_score` as keyof TrustIndexSubmitPayload] as number) >=
      1,
  ).length;
  const allScoresSet = filledCount === TRUST_DIMENSIONS.length;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <aside
      className="trust-index-dock"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <header className="trust-index-dock__banner">
        <div className="trust-index-dock__seal" aria-hidden>
          <OliveBranch className="trust-index-dock__branch" />
          <span className="trust-index-dock__stamp">رأيك</span>
          <OliveBranch flip className="trust-index-dock__branch" />
        </div>
        <div className="trust-index-dock__intro">
          <p className="trust-index-dialog__kicker">مؤشر ثقة الجمهور</p>
          <h2 id={titleId} className="trust-index-dialog__title">
            ما مدى ثقتك بهذا المحتوى؟
          </h2>
          <p className="trust-index-dialog__lead">
            وصلت للنهاية — أربعة أسئلة سريعة، هويتك غير مسجّلة
          </p>
        </div>
        <button
          type="button"
          className="trust-index-dock__close"
          onClick={onDismiss}
          aria-label="إغلاق التقييم"
        >
          <X />
        </button>
      </header>

      <div className="trust-index-dialog__body">
        {TRUST_DIMENSIONS.map((dimension, index) => (
          <section key={dimension.key} className="trust-index-dialog__card">
            <span className="trust-index-dialog__index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <StarRatingInput
              badge={dimension.label}
              label={dimension.question}
              value={
                scores[
                  `${dimension.key}_score` as keyof TrustIndexSubmitPayload
                ] as number
              }
              disabled={submitMutation.isPending}
              onChange={(value) =>
                setScores((current) => ({
                  ...current,
                  [`${dimension.key}_score`]: value,
                }))
              }
            />
          </section>
        ))}

        <div className="trust-index-dialog__note">
          <label htmlFor="trust-index-comment">
            في جملة واحدة، ما أكثر شيء أثر على تقييمك؟
            <span> اختياري</span>
          </label>
          <Textarea
            id="trust-index-comment"
            value={scores.comment ?? ""}
            maxLength={2000}
            rows={2}
            disabled={submitMutation.isPending}
            placeholder="مثلاً: وضوح المصادر، أو نبرة الخبر..."
            onChange={(event) =>
              setScores((current) => ({
                ...current,
                comment: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <footer className="trust-index-dialog__footer trust-index-dock__footer">
        <div className="trust-index-dialog__actions">
          <Button
            variant="outline"
            disabled={submitMutation.isPending}
            onClick={onDismiss}
          >
            لاحقاً
          </Button>
          <Button
            disabled={!allScoresSet || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
          >
            {submitMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            إرسال التقييم
          </Button>
        </div>
      </footer>
    </aside>,
    document.body,
  );
}
