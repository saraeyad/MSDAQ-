import { SourceConsentBanner } from "@/features/publishing-flow/components/SourceConsentBanner";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { CredibilityUnavailableNote } from "@/features/tools/components/CredibilityUnavailableNote";
import type { ArticleSource } from "@/types";

interface Step5CredibilityProps {
  sources: ArticleSource[];
  onComplete: () => void;
  onBack?: () => void;
}

export function Step5Credibility({
  sources,
  onComplete,
  onBack,
}: Step5CredibilityProps) {
  return (
    <div className="space-y-4">
      <SourceConsentBanner sources={sources} />
      <CredibilityUnavailableNote />
      <p className="text-muted-foreground">
        فحص المصداقية إرشادي — يمكنك المتابعة الآن حتى يعود الفحص للعمل.
      </p>
      <StepActionsRow onBack={onBack}>
        <NextStepButton onClick={onComplete} />
      </StepActionsRow>
    </div>
  );
}
