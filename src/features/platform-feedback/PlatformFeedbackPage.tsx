import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import {
  DateRangeFilter,
  getDefaultDateRange,
  isAllDatesRange,
} from "@/components/ui/date-range-filter";
import { getApiErrorMessage } from "@/lib/api-data";
import { paginateList } from "@/lib/table-pagination";
import { PlatformFeedback_APIs } from "@/services/api/platform-feedback";
import { TRUST_FEEDBACK_PAGE_SIZE } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquareQuote,
  MessageSquareText,
  Quote,
  UserRound,
} from "lucide-react";
import { useState } from "react";

export default function PlatformFeedbackPage() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  const hasActiveFilter = !isAllDatesRange(dateRange);

  const listQuery = useQuery({
    queryKey: ["platform-feedback", page, dateRange.start, dateRange.end],
    queryFn: () =>
      PlatformFeedback_APIs.list({
        page,
        start: hasActiveFilter ? dateRange.start : undefined,
        end: hasActiveFilter ? dateRange.end : undefined,
      }),
  });

  const {
    items,
    total,
    currentPage,
    lastPage,
    pageSize,
  } = paginateList(
    listQuery.data?.items ?? [],
    page,
    listQuery.data?.pagination,
    TRUST_FEEDBACK_PAGE_SIZE,
  );

  const handleDateRangeChange = (next: { start: string; end: string }) => {
    setDateRange(next);
    setPage(1);
  };

  return (
    <div className="platform-feedback-page space-y-6">
      <header className="platform-feedback-page__hero">
        <div className="platform-feedback-page__hero-glow" aria-hidden />
        <div className="platform-feedback-page__hero-icon" aria-hidden>
          <MessageSquareQuote />
        </div>
        <div className="platform-feedback-page__hero-body">
          <p className="platform-feedback-page__kicker">صوت الجمهور</p>
          <h2 className="platform-feedback-page__title">ملاحظات المنصة</h2>
          <p className="platform-feedback-page__lead">
            آراء مجهولة حول منصة مِصداق — رسائل القرّاء كما وصلت، بدون
            درجات أو تصدير.
          </p>
        </div>
        {!listQuery.isLoading && !listQuery.isError ? (
          <div className="platform-feedback-page__stat">
            <span className="platform-feedback-page__stat-value">
              {total.toLocaleString("ar")}
            </span>
            <span className="platform-feedback-page__stat-label">رسالة</span>
          </div>
        ) : null}
      </header>

      <div className="admin-date-toolbar">
        <DateRangeFilter
          value={dateRange}
          onChange={handleDateRangeChange}
          disabled={listQuery.isFetching}
          placeholder="كل التواريخ"
        />
      </div>

      {listQuery.isError ? (
        <AdminPanel accent="warning">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(listQuery.error)}
          </p>
        </AdminPanel>
      ) : listQuery.isLoading ? (
        <div className="platform-feedback-wall platform-feedback-wall--loading">
          {Array.from({ length: 5 }, (_, index) => (
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
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={MessageSquareText}
          title={
            hasActiveFilter ? "لا توجد ملاحظات في هذا النطاق" : "لا توجد ملاحظات بعد"
          }
          description={
            hasActiveFilter
              ? "جرّب توسيع نطاق التاريخ أو إزالة الفلتر."
              : "ستظهر هنا آراء الزوار عن المنصة."
          }
        />
      ) : (
        <section className="platform-feedback-wall" aria-label="رسائل الزوار">
          <div className="platform-feedback-wall__inner">
            {items.map((item, index) => (
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
                  <p className="platform-feedback-card__comment">{item.comment}</p>
                  <footer className="platform-feedback-card__meta">
                    <span className="platform-feedback-card__anon">زائر مجهول</span>
                    <time
                      className="platform-feedback-card__date"
                      dateTime={item.created_at}
                    >
                      {new Date(item.created_at).toLocaleString("ar")}
                    </time>
                  </footer>
                </div>
              </article>
            ))}
          </div>

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
        </section>
      )}
    </div>
  );
}
