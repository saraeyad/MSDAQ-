import { usePublicCopy } from "@/context/locale";
import { OliveBranch } from "@/components/brand/olive-branch";
import { MessageSquareQuote } from "lucide-react";

interface ArticleTrustFeedbackButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function ArticleTrustFeedbackButton({
  onClick,
  disabled = false,
}: ArticleTrustFeedbackButtonProps) {
  const { trustIndex } = usePublicCopy();
  return (
    <div className="article-trust-feedback-cta">
      <p className="article-trust-feedback-cta__lead">
        {trustIndex.articleRatePrompt}
      </p>
      <button
        type="button"
        className="article-trust-feedback-cta__button"
        onClick={onClick}
        disabled={disabled}
      >
        <OliveBranch className="article-trust-feedback-cta__branch" />
        <MessageSquareQuote className="article-trust-feedback-cta__icon" aria-hidden />
        <span>{trustIndex.articleRateButton}</span>
        <OliveBranch flip className="article-trust-feedback-cta__branch" />
      </button>
    </div>
  );
}
