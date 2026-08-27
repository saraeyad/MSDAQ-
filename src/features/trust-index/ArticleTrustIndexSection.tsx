import { Button } from "@/components/ui/button";
import { isAllDatesRange } from "@/components/ui/date-range-filter";
import { ArticleTrustResponsesBlock } from "@/features/trust-index/components/ArticleTrustResponsesBlock";
import { TrustIndexDateFilter } from "@/features/trust-index/components/TrustIndexDateFilter";
import { TrustIndexSummaryPanel } from "@/features/trust-index/components/TrustIndexSummaryPanel";
import { getApiErrorMessage } from "@/lib/api-data";
import { triggerBlobDownload } from "@/lib/blob-download";
import { TrustIndex_APIs } from "@/services/api/trust-index";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Loader2, MessageSquareQuote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ArticleTrustIndexSectionProps {
  articleId: number | string;
}

const ALL_DATES = { start: "", end: "" };

export function ArticleTrustIndexSection({
  articleId,
}: ArticleTrustIndexSectionProps) {
  const [draftDates, setDraftDates] = useState(ALL_DATES);
  const [appliedDates, setAppliedDates] = useState(ALL_DATES);

  const hasActiveFilter = !isAllDatesRange(appliedDates);
  const filterParams = {
    start: hasActiveFilter ? appliedDates.start : undefined,
    end: hasActiveFilter ? appliedDates.end : undefined,
  };

  const summaryQuery = useQuery({
    queryKey: [
      "trust-index-article-summary",
      articleId,
      appliedDates.start,
      appliedDates.end,
    ],
    queryFn: () => TrustIndex_APIs.articleSummary(articleId, filterParams),
  });

  const responsesQuery = useQuery({
    queryKey: [
      "trust-index-article-responses",
      articleId,
      appliedDates.start,
      appliedDates.end,
    ],
    queryFn: () => TrustIndex_APIs.articleResponses(articleId, filterParams),
  });

  const total = responsesQuery.data?.items.length ?? 0;

  const exportMutation = useMutation({
    mutationFn: () => TrustIndex_APIs.articleExport(articleId, filterParams),
    onSuccess: ({ blob, filename }) => {
      triggerBlobDownload(blob, filename);
      toast.success("تم تنزيل النتائج");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const applyDates = () => {
    setAppliedDates(draftDates);
  };

  const clearDates = () => {
    setDraftDates(ALL_DATES);
    setAppliedDates(ALL_DATES);
  };

  return (
    <div className="article-trust-feedback">
      <div className="article-trust-feedback__hero">
        <span className="article-trust-feedback__hero-glow" aria-hidden />
        <span className="article-trust-feedback__hero-icon" aria-hidden>
          <MessageSquareQuote />
        </span>
        <div className="article-trust-feedback__hero-body">
          <p className="article-trust-feedback__kicker">تقييم القرّاء</p>
          <p className="article-trust-feedback__lead">
            ملخص مؤشر الثقة واستجابات القرّاء على هذا المقال خلال الفترة
            المحددة.
          </p>
        </div>
        {total > 0 ? (
          <div className="article-trust-feedback__stat">
            <span className="article-trust-feedback__stat-value">{total}</span>
            <span className="article-trust-feedback__stat-label">استجابة</span>
          </div>
        ) : null}
      </div>

      <div className="article-trust-feedback__toolbar trust-toolbar">
        <TrustIndexDateFilter
          value={draftDates}
          onChange={setDraftDates}
          onApply={applyDates}
          onClearAll={clearDates}
          showClearAll={hasActiveFilter}
          disabled={summaryQuery.isFetching || responsesQuery.isFetching}
        />
        <Button
          variant="outline"
          size="sm"
          className="article-trust-feedback__export"
          disabled={exportMutation.isPending}
          onClick={() => exportMutation.mutate()}
        >
          {exportMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          تنزيل النتائج
        </Button>
      </div>

      {summaryQuery.isError ? (
        <p className="article-trust-feedback__error">
          {getApiErrorMessage(summaryQuery.error)}
        </p>
      ) : (
        <div className="article-trust-feedback__summary">
          <TrustIndexSummaryPanel
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
          />
        </div>
      )}

      <div className="article-trust-feedback__responses">
        <header className="article-trust-feedback__responses-header">
          <h4 className="article-trust-feedback__responses-title">الاستجابات</h4>
          {total > 0 ? (
            <span className="article-trust-feedback__responses-badge">
              {total}
            </span>
          ) : null}
        </header>

        <ArticleTrustResponsesBlock
          articleId={articleId}
          filterParams={filterParams}
          hasDateFilter={hasActiveFilter}
          className="article-trust-feedback__responses-body"
        />
      </div>
    </div>
  );
}
