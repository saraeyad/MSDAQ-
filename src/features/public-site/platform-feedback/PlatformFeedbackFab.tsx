import { OliveBranch } from "@/components/ghazawiya/olive-branch";
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
      aria-label="شاركنا رأيك في منصة مِصداق"
    >
      <OliveBranch className="platform-feedback-fab__branch" />
      <MessageSquareText className="platform-feedback-fab__icon" aria-hidden />
      <span className="platform-feedback-fab__label">رأيك</span>
      <OliveBranch flip className="platform-feedback-fab__branch" />
    </button>
  );
}
