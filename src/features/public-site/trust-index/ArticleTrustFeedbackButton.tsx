import { OliveBranch } from "@/components/ghazawiya/olive-branch";
import { MessageSquareQuote } from "lucide-react";

interface ArticleTrustFeedbackButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function ArticleTrustFeedbackButton({
  onClick,
  disabled = false,
}: ArticleTrustFeedbackButtonProps) {
  return (
    <div className="article-trust-feedback-cta">
      <p className="article-trust-feedback-cta__lead">
        ما مدى ثقتك بهذا المحتوى؟ شاركنا تقييمك — مجهول ويستغرق دقيقة.
      </p>
      <button
        type="button"
        className="article-trust-feedback-cta__button"
        onClick={onClick}
        disabled={disabled}
      >
        <OliveBranch className="article-trust-feedback-cta__branch" />
        <MessageSquareQuote className="article-trust-feedback-cta__icon" aria-hidden />
        <span>قيّم هذا المقال</span>
        <OliveBranch flip className="article-trust-feedback-cta__branch" />
      </button>
    </div>
  );
}
