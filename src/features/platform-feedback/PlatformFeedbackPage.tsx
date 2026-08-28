import { Button } from "@/components/ui/button";
import {
  DateRangeFilter,
  getDefaultDateRange,
  isAllDatesRange,
} from "@/components/ui/date-range-filter";
import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { PlatformFeedbackSummary } from "@/features/platform-feedback/components/PlatformFeedbackSummary";
import { TrustResponseDimensionsCell } from "@/features/trust-index/components/TrustResponseDimensionsCell";
import { getApiErrorMessage } from "@/lib/api-data";
import { triggerBlobDownload } from "@/lib/blob-download";
import { paginateList } from "@/lib/table-pagination";
import {
  PLATFORM_TRUST_DIMENSIONS,
  trustBandClass,
  trustBandLabel,
} from "@/lib/trust-index-labels";
import { PlatformFeedback_APIs } from "@/services/api/platform-feedback";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Download,
  Loader2,
  MessageSquareText,
  Quote,
  Speech,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const INBOX_PAGE_SIZE = 5;

export default function PlatformFeedbackPage() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  const hasActiveFilter = !isAllDatesRange(dateRange);
  const filterParams = {
    start: hasActiveFilter ? dateRange.start : undefined,
    end: hasActiveFilter ? dateRange.end : undefined,
  };

  const summaryQuery = useQuery({
    queryKey: ["platform-feedback-summary", dateRange.start, dateRange.end],
    queryFn: () => PlatformFeedback_APIs.summary(filterParams),
  });

  const responsesQuery = useQuery({
    queryKey: [
      "platform-feedback-responses",
      dateRange.start,
      dateRange.end,
    ],
    queryFn: () => PlatformFeedback_APIs.responsesAll(filterParams),
  });

  const allResponses = responsesQuery.data?.items ?? [];

  const { items, total, currentPage, lastPage, pageSize } = paginateList(
    allResponses,
    page,
    undefined,
    INBOX_PAGE_SIZE,
  );

  useEffect(() => {
    if (page > 1 && items.length === 0 && allResponses.length > 0) {
      setPage(1);
    }
  }, [allResponses.length, items.length, page]);

  const exportMutation = useMutation({
    mutationFn: () => PlatformFeedback_APIs.export(filterParams),
    onSuccess: ({ blob, filename }) => {
      triggerBlobDownload(blob, filename);
      toast.success("تم تنزيل النتائج");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const handleDateRangeChange = (next: { start: string; end: string }) => {
    setDateRange(next);
    setPage(1);
  };

  const responseCount = summaryQuery.data?.count ?? total;

  return (
    <div className="platform-feedback-page">
      <header className="platform-feedback-page__hero">
        <div className="platform-feedback-page__hero-glow" aria-hidden />
        <div className="platform-feedback-page__hero-icon" aria-hidden>
          <Speech />
        </div>
        <div className="platform-feedback-page__hero-body">
          <p className="platform-feedback-page__kicker">صندوق آراء الزوار</p>
          <h2 className="platform-feedback-page__title">تقييمات المنصة</h2>
          <p className="platform-feedback-page__lead">
            تقييمات مجهولة لتجربة صبارة بوست ككل — ليست تقييمات المقالات.
          </p>
        </div>
        {!summaryQuery.isLoading && !summaryQuery.isError && responseCount > 0 ? (
          <div className="platform-feedback-page__stat">
            <span className="platform-feedback-page__stat-value">
              {responseCount.toLocaleString("ar")}
            </span>
            <span className="platform-feedback-page__stat-label">رسالة</span>
          </div>
        ) : null}
      </header>

      <div className="platform-feedback-page__toolbar">
        <DateRangeFilter
          value={dateRange}
          onChange={handleDateRangeChange}
          disabled={summaryQuery.isFetching || responsesQuery.isFetching}
          placeholder="كل التواريخ"
        />
        <Button
          variant="outline"
          size="sm"
          className="platform-feedback-page__export"
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
        <AdminPanel accent="warning">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(summaryQuery.error)}
          </p>
        </AdminPanel>
      ) : (
        <div className="platform-feedback-page__layout">
          <PlatformFeedbackSummary
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
          />

          <section className="platform-feedback-inbox" aria-label="رسائل الزوار">
            <header className="platform-feedback-inbox__header">
              <MessageSquareText className="platform-feedback-inbox__header-icon" />
              <h3 className="platform-feedback-inbox__title">صندوق الرسائل</h3>
              {total > 0 ? (
                <span className="platform-feedback-inbox__badge">{total}</span>
              ) : null}
            </header>

            {responsesQuery.isLoading ? (
              <div className="platform-feedback-wall platform-feedback-wall--loading">
                {Array.from({ length: INBOX_PAGE_SIZE }, (_, index) => (
                  <div
                    key={index}
                    className="platform-feedback-card platform-feedback-card--skeleton"
                    aria-hidden
                  >
                    <div className="platform-feedback-card__avatar" />
                    <div className="platform-feedback-card__bubble">
                      <div className="platform-feedback-card__skeleton-line platform-feedback-card__skeleton-line--wide" />
                      <div className="platform-feedback-card__skeleton-line" />
                      <div className="platform-feedback-card__skeleton-line platform-feedback-card__skeleton-line--short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : responsesQuery.isError ? (
              <p className="platform-feedback-inbox__error">
                {getApiErrorMessage(responsesQuery.error)}
              </p>
            ) : items.length === 0 ? (
              <AdminEmptyState
                icon={MessageSquareText}
                title={
                  hasActiveFilter
                    ? "لا توجد رسائل في هذا النطاق"
                    : "لا توجد رسائل بعد"
                }
                description={
                  hasActiveFilter
                    ? "جرّب توسيع نطاق التاريخ أو إزالة الفلتر."
                    : "ستظهر هنا تقييمات الزوار عن المنصة كما وصلت."
                }
              />
            ) : (
              <div className="platform-feedback-wall">
                <div className="platform-feedback-wall__inner">
                  {items.map((item, index) => {
                    const comment = item.comment?.trim();

                    return (
                      <article
                        key={item.id}
                        className="platform-feedback-card"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        <div className="platform-feedback-card__avatar" aria-hidden>
                          <UserRound />
                        </div>
                        <div className="platform-feedback-card__bubble">
                          <Quote
                            className="platform-feedback-card__quote-mark"
                            aria-hidden
                          />
                          <p
                            className={
                              comment
                                ? "platform-feedback-card__comment"
                                : "platform-feedback-card__comment platform-feedback-card__comment--empty"
                            }
                          >
                            {comment || "قيّم المنصة دون كتابة ملاحظة."}
                          </p>
                          <div className="platform-feedback-card__scores">
                            <span
                              className={`trust-band-pill ${trustBandClass(item.trust_level)}`}
                            >
                              {item.trust_percentage}% · {trustBandLabel(item.trust_level)}
                            </span>
                            <TrustResponseDimensionsCell
                              scores={item.scores}
                              dimensions={PLATFORM_TRUST_DIMENSIONS}
                            />
                          </div>
                          <footer className="platform-feedback-card__meta">
                            <span className="platform-feedback-card__anon">
                              زائر مجهول
                            </span>
                            <time
                              className="platform-feedback-card__date"
                              dateTime={item.created_at}
                            >
                              {new Date(item.created_at).toLocaleString("ar")}
                            </time>
                          </footer>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {lastPage > 1 ? (
                  <div className="platform-feedback-wall__footer">
                    <AdminPagination
                      currentPage={currentPage}
                      lastPage={lastPage}
                      total={total}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      label="صفحات الملاحظات"
                    />
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
