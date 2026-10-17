import { AiCheckProcessingDialog } from "@/features/publishing-flow/components/AiCheckProcessingDialog";
import { AiCheckStatusBanner } from "@/features/publishing-flow/components/AiCheckStatusBanner";
import { CredibilityResultPanel } from "@/features/tools/components/CredibilityResultPanel";
import { StandardsHighlightedText } from "@/features/tools/components/StandardsHighlightedText";
import { StandardsResultCard } from "@/features/tools/components/StandardsResultCard";
import { useArticleAiCheck } from "@/hooks/publishing/useArticleAiCheck";
import { Loader2 } from "lucide-react";

interface ArticleEditorialChecksSectionProps {
  articleId: number | string;
  title: string;
  contentFormal?: string | null;
}

export function ArticleEditorialChecksSection({
  articleId,
  title,
  contentFormal = "",
}: ArticleEditorialChecksSectionProps) {
  const body = contentFormal ?? "";
  const standards = useArticleAiCheck(articleId, "standards");
  const credibility = useArticleAiCheck(articleId, "credibility");

  const loading =
    standards.loadingInitial ||
    credibility.loadingInitial;

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جاري تحميل نتائج الفحص…
      </p>
    );
  }

  const hasStandards =
    standards.check?.status === "done" && standards.result != null;
  const hasCredibility =
    credibility.check?.status === "done" && credibility.result != null;
  const hasActivity =
    hasStandards ||
    hasCredibility ||
    standards.check != null ||
    credibility.check != null;

  if (!hasActivity) {
    return (
      <p className="text-sm text-muted-foreground">
        لم يُجرَ فحص معايير أو مصداقية على هذا المقال بعد.
      </p>
    );
  }

  const credibilityInProgress = credibility.isPolling;

  return (
    <div className="space-y-8">
      <AiCheckProcessingDialog
        open={credibilityInProgress}
        type="credibility"
      />
      <div className="space-y-3">
        <h4 className="font-medium">فحص المعايير</h4>
        <AiCheckStatusBanner
          check={standards.check}
          inProgressLabel="جاري فحص المعايير…"
        />
        {hasStandards && standards.result ? (
          <>
            <StandardsResultCard
              result={standards.result}
              title={title}
              content={body}
            />
            <StandardsHighlightedText
              title={title}
              content={body}
              criteria={standards.result.criteria}
            />
          </>
        ) : null}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">فحص المصداقية</h4>
        {credibility.check?.status === "failed" ? (
          <AiCheckStatusBanner check={credibility.check} />
        ) : null}
        {hasCredibility && credibility.result ? (
          <CredibilityResultPanel result={credibility.result} />
        ) : null}
      </div>
    </div>
  );
}
