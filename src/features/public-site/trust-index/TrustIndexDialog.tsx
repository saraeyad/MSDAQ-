import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRatingInput } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  isPublicFeedbackNotFound,
  isPublicFeedbackRateLimited,
} from "@/lib/public-feedback-errors";
import { TRUST_DIMENSIONS } from "@/lib/trust-index-labels";
import { TrustIndex_APIs } from "@/services/api/trust-index";
import type { TrustIndexSubmitPayload } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TrustIndexDialogProps {
  articleId: number | string;
  open: boolean;
  onDismiss: () => void;
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
}: TrustIndexDialogProps) {
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
      toast.error(getApiErrorMessage(error));
    },
  });

  const filledCount = TRUST_DIMENSIONS.filter(
    (dimension) =>
      (scores[`${dimension.key}_score` as keyof TrustIndexSubmitPayload] as number) >=
      1,
  ).length;
  const allScoresSet = filledCount === TRUST_DIMENSIONS.length;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onDismiss();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="trust-index-dialog gap-0 p-0 sm:max-w-md">
        <DialogHeader className="trust-index-dialog__banner !grid !grid-cols-[1fr_auto] !items-center !gap-2.5 !text-start">
          <div className="trust-index-dialog__intro">
            <p className="trust-index-dialog__kicker">مؤشر ثقة الجمهور</p>
            <DialogTitle className="trust-index-dialog__title">
              ما مدى ثقتك بهذا المحتوى؟
            </DialogTitle>
            <DialogDescription className="trust-index-dialog__lead">
              استطلاع مجهول · أربعة أسئلة فقط
            </DialogDescription>
          </div>
          <div className="trust-index-dialog__progress" aria-hidden>
            {TRUST_DIMENSIONS.map((dimension) => {
              const scored =
                (scores[
                  `${dimension.key}_score` as keyof TrustIndexSubmitPayload
                ] as number) >= 1;
              return (
                <span
                  key={dimension.key}
                  className={
                    scored
                      ? "trust-index-dialog__dot trust-index-dialog__dot--on"
                      : "trust-index-dialog__dot"
                  }
                  title={dimension.label}
                />
              );
            })}
          </div>
        </DialogHeader>

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

        <DialogFooter className="trust-index-dialog__footer">
          <p className="trust-index-dialog__anon">هويتك غير مسجّلة · صوتك يُحتسب</p>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
