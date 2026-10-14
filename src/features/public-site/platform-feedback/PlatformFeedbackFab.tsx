import { usePlatformFeedback } from "@/context/platform-feedback";
import { useLocale, usePublicCopy } from "@/context/locale";
import { cn } from "@/lib/utils";
import { MessageSquareText } from "lucide-react";

export function PlatformFeedbackFab() {
  const { feedbackOpen, openFeedback, trustIndexOpen } = usePlatformFeedback();
  const { locale } = useLocale();
  const { feedback } = usePublicCopy();
  const isEnglish = locale === "en";

  if (trustIndexOpen || feedbackOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className={cn(
        "platform-feedback-fab",
        isEnglish && "platform-feedback-fab--en",
      )}
      onClick={openFeedback}
      aria-label={feedback.fabAria}
    >
      <span className="platform-feedback-fab__label">{feedback.fabChip}</span>
      <span className="platform-feedback-fab__mark" aria-hidden>
        <MessageSquareText strokeWidth={2.25} />
      </span>
    </button>
  );
}
