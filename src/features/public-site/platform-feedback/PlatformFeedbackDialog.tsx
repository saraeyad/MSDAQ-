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
import { useLocale, usePublicCopy } from "@/context/locale";
import { getApiErrorMessage } from "@/lib/api";
import { isPublicFeedbackRateLimited } from "@/lib/site";
import { PlatformFeedback_APIs } from "@/services/api/platform-feedback";
import type { PlatformFeedbackSubmitPayload } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PlatformFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PlatformFeedbackFormState = PlatformFeedbackSubmitPayload & {
  comment: string;
};

const INITIAL_SCORES: PlatformFeedbackFormState = {
  accuracy_score: 0,
  credibility_score: 0,
  objectivity_score: 0,
  transparency_score: 0,
  consistency_score: 0,
  comment: "",
};

export function PlatformFeedbackDialog({
  open,
  onOpenChange,
}: PlatformFeedbackDialogProps) {
  const { dir } = useLocale();
  const { common, feedback, trustIndex } = usePublicCopy();
  const dimensions = trustIndex.platformDimensions;
  const [scores, setScores] = useState(INITIAL_SCORES);

  const submitMutation = useMutation({
    mutationFn: () => {
      const payload: PlatformFeedbackSubmitPayload = {
        accuracy_score: scores.accuracy_score,
        credibility_score: scores.credibility_score,
        objectivity_score: scores.objectivity_score,
        transparency_score: scores.transparency_score,
        consistency_score: scores.consistency_score,
      };
      const comment = scores.comment?.trim();
      if (comment) payload.comment = comment;
      return PlatformFeedback_APIs.submitPublic(payload);
    },
    onSuccess: () => {
      toast.success(feedback.thanks);
      setScores(INITIAL_SCORES);
      onOpenChange(false);
    },
    onError: (error) => {
      if (isPublicFeedbackRateLimited(error)) {
        onOpenChange(false);
        return;
      }
      toast.error(getApiErrorMessage(error));
    },
  });

  const filledCount = dimensions.filter(
    (dimension) =>
      (scores[`${dimension.key}_score` as keyof PlatformFeedbackFormState] as number) >=
      1,
  ).length;
  const allScoresSet = filledCount === dimensions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="trust-index-dialog gap-0 p-0 sm:max-w-md"
      >
        <DialogHeader className="trust-index-dialog__banner ghazawiya-pattern !grid !text-start">
          <div className="trust-index-dialog__intro">
            <p className="trust-index-dialog__kicker">
              {feedback.platformKicker}
            </p>
            <DialogTitle className="trust-index-dialog__title">
              {feedback.platformTitle}
            </DialogTitle>
            <DialogDescription className="trust-index-dialog__lead">
              {feedback.platformLead}
            </DialogDescription>
          </div>
          <div className="trust-index-dialog__progress" aria-hidden>
            {dimensions.map((dimension) => {
              const scored =
                (scores[
                  `${dimension.key}_score` as keyof PlatformFeedbackFormState
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
          {dimensions.map((dimension, index) => (
            <section key={dimension.key} className="trust-index-dialog__card">
              <span className="trust-index-dialog__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <StarRatingInput
                badge={dimension.label}
                label={dimension.question}
                value={
                  scores[
                    `${dimension.key}_score` as keyof PlatformFeedbackFormState
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
            <label htmlFor="platform-feedback-comment">
              {feedback.platformCommentLabel}
              <span>{feedback.platformCommentOptional}</span>
            </label>
            <Textarea
              id="platform-feedback-comment"
              value={scores.comment ?? ""}
              maxLength={2000}
              rows={2}
              disabled={submitMutation.isPending}
              placeholder={feedback.platformCommentPlaceholder}
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
          <p className="trust-index-dialog__anon">{feedback.anonNote}</p>
          <div className="trust-index-dialog__actions">
            <Button
              variant="outline"
              disabled={submitMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              {common.later}
            </Button>
            <Button
              disabled={!allScoresSet || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {common.submitRating}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
