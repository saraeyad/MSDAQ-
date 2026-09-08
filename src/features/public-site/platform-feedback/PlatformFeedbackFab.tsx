import { usePlatformFeedback } from "@/context/platform-feedback";
import { MessageSquareText } from "lucide-react";

export function PlatformFeedbackFab() {
  const { feedbackOpen, openFeedback, trustIndexOpen } = usePlatformFeedback();

  if (trustIndexOpen || feedbackOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className="platform-feedback-fab"
      onClick={openFeedback}
      aria-label="شاركنا رأيك في منصة صبارة بوست"
    >
      <span className="platform-feedback-fab__icon" aria-hidden>
        <MessageSquareText className="size-4" strokeWidth={2.2} />
      </span>
      <span className="platform-feedback-fab__label">رأيك</span>
    </button>
  );
}
