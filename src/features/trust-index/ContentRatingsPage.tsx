import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { ArticleTrustResponsesBlock } from "@/features/trust-index/components/ArticleTrustResponsesBlock";
import { getApiErrorMessage } from "@/lib/api-data";
import { mediaTypeLabel } from "@/lib/media-labels";
import { resolveMediaUrl } from "@/lib/media-url";
import { paginateList } from "@/lib/table-pagination";
import { sameArticleId } from "@/lib/article-id";
import {
  formatTrustPercentage,
  trustBandClass,
  trustBandLabel,
  TRUST_DIMENSIONS,
} from "@/lib/trust-index-labels";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { TrustIndex_APIs } from "@/services/api/trust-index";
import type { StaffArticle, TrustIndexSummary } from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, MessageSquareQuote, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { staffArticlePath } from "@/router/routes";

const CONTENT_RATINGS_PAGE_SIZE = 7;

function useArticleSummaries(articles: StaffArticle[]) {
  return useQueries({
    queries: articles.map((article) => ({
      queryKey: ["content-ratings-summary", article.id],
      queryFn: () => TrustIndex_APIs.articleSummary(article.id),
      staleTime: 60_000,
    })),
  });
}

function summaryByArticleId(
  articles: StaffArticle[],
  summaryQueries: ReturnType<typeof useArticleSummaries>,
): Map<number | string, TrustIndexSummary | undefined> {
  const map = new Map<number | string, TrustIndexSummary | undefined>();
  articles.forEach((article, index) => {
    map.set(article.id, summaryQueries[index]?.data);
  });
  return map;
}

function TrustScoreRing({
  percentage,
  band,
  compact = false,
}: {
  percentage: number | null | undefined;
  band: TrustIndexSummary["overall"]["band"];
  compact?: boolean;
}) {
  const hasData = percentage != null;
  const size = compact ? 44 : 56;
  const stroke = compact ? 4 : 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = hasData ? Math.min(100, Math.max(0, percentage)) : 0;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "content-ratings-score",
        compact && "content-ratings-score--compact",
        hasData && trustBandClass(band),
      )}
      aria-label={
        hasData
          ? `مؤشر الثقة ${formatTrustPercentage(percentage)}`
          : "لا توجد استجابات"
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          className="content-ratings-score__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        {hasData ? (
          <circle
            className="content-ratings-score__fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </svg>
      <span className="content-ratings-score__value">
        {hasData ? formatTrustPercentage(percentage) : "—"}
      </span>
    </div>
  );
}

function ContentRatingsSidebarItem({
  article,
  summary,
  selected,
  onSelect,
}: {
  article: StaffArticle;
  summary?: TrustIndexSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const coverUrl = resolveMediaUrl(article.cover_image);
  const count = summary?.count ?? 0;

  return (
    <button
      type="button"
      className={cn(
        "content-ratings-sidebar__item",
        selected && "content-ratings-sidebar__item--selected",
      )}
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
    >
      {coverUrl ? (
        <img src={coverUrl} alt="" className="content-ratings-sidebar__thumb" />
      ) : (
        <div className="content-ratings-sidebar__thumb-fallback">
          {mediaTypeLabel(article.media_type)}
        </div>
      )}

      <div className="content-ratings-sidebar__copy">
        {article.category?.name_ar ? (
          <span className="content-ratings-sidebar__category">
            {article.category.name_ar}
          </span>
        ) : null}
        <span className="content-ratings-sidebar__title">{article.title}</span>
        <span className="content-ratings-sidebar__meta">
          {count > 0 ? `${count} استجابة` : "بلا استجابات"}
          {" · "}
          {new Date(article.updated_at).toLocaleDateString("ar")}
        </span>
      </div>

      <TrustScoreRing
        compact
        percentage={summary?.overall.percentage}
        band={summary?.overall.band ?? null}
      />
    </button>
  );
}

function ContentRatingsDetailPanel({
  article,
  summary,
  summaryLoading,
}: {
  article: StaffArticle;
  summary?: TrustIndexSummary;
  summaryLoading: boolean;
}) {
  const coverUrl = resolveMediaUrl(article.cover_image);

  return (
    <div className="content-ratings-detail">
      <div
        className="content-ratings-detail__hero"
        data-has-cover={coverUrl ? "true" : "false"}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="content-ratings-detail__hero-image"
          />
        ) : null}
        <div className="content-ratings-detail__hero-overlay" />
        <div className="content-ratings-detail__hero-content">
          <div className="content-ratings-detail__chips">
            {article.category?.name_ar ? (
              <span className="content-ratings-detail__chip">
                {article.category.name_ar}
              </span>
            ) : null}
            <span className="content-ratings-detail__chip">
              {mediaTypeLabel(article.media_type)}
            </span>
          </div>
          <h2 className="content-ratings-detail__title">{article.title}</h2>
          <p className="content-ratings-detail__byline">
            {article.author.name}
            {" · "}
            {new Date(article.updated_at).toLocaleDateString("ar")}
          </p>
          <Link
            to={staffArticlePath(article.id)}
            className="content-ratings-detail__article-link"
          >
            <span>فتح المقال في الغرفة</span>
            <ExternalLink aria-hidden className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="content-ratings-detail__summary">
        <div className="content-ratings-detail__summary-main">
          <TrustScoreRing
            percentage={summary?.overall.percentage}
            band={summary?.overall.band ?? null}
          />
          <div>
            <p className="content-ratings-detail__summary-label">مؤشر الثقة</p>
            <p
              className={cn(
                "content-ratings-detail__summary-band",
                trustBandClass(summary?.overall.band),
              )}
            >
              {summaryLoading
                ? "…"
                : summary?.count
                  ? trustBandLabel(summary.overall.band)
                  : "لا توجد بيانات"}
            </p>
            <p className="content-ratings-detail__summary-count">
              {summaryLoading
                ? "جاري التحميل…"
                : `${summary?.count ?? 0} استجابة من القرّاء`}
            </p>
          </div>
        </div>

        {summary && summary.count > 0 ? (
          <div className="content-ratings-detail__dimensions">
            {TRUST_DIMENSIONS.map((dimension) => {
              const value = summary.dimensions[dimension.key].average;
              const width =
                value != null ? Math.min(100, Math.max(0, (value / 5) * 100)) : 0;

              return (
                <div key={dimension.key} className="content-ratings-dimension">
                  <div className="content-ratings-dimension__head">
                    <span>{dimension.label}</span>
                    <span>{value != null ? value.toFixed(1) : "—"}</span>
                  </div>
                  <div className="content-ratings-dimension__track">
                    <div
                      className="content-ratings-dimension__fill"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <section className="content-ratings-detail__responses">
        <header className="content-ratings-detail__responses-header">
          <div className="content-ratings-detail__responses-heading">
            <MessageSquareQuote aria-hidden className="size-4" />
            <h3>الاستجابات</h3>
          </div>
          <p className="content-ratings-detail__responses-lead">
            تقييمات القرّاء التفصيلية على هذا المقال
          </p>
        </header>
        <ArticleTrustResponsesBlock
          articleId={article.id}
          enabled
          className="content-ratings-detail__responses-body"
        />
      </section>
    </div>
  );
}

export default function ContentRatingsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const page = Math.max(1, Number(params.get("page") ?? "1"));

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["content-ratings-articles", "published"],
    queryFn: () =>
      ArticlesStaff_APIs.list({
        status: "published",
      }),
  });

  const {
    items: articles,
    total,
    currentPage,
    lastPage,
    pageSize,
  } = paginateList(
    data?.items ?? [],
    page,
    undefined,
    CONTENT_RATINGS_PAGE_SIZE,
  );

  const summaryQueries = useArticleSummaries(articles);
  const summaries = useMemo(
    () => summaryByArticleId(articles, summaryQueries),
    [articles, summaryQueries],
  );

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter((article) =>
      article.title.toLowerCase().includes(query),
    );
  }, [articles, search]);

  useEffect(() => {
    setSelectedId(null);
  }, [page]);

  useEffect(() => {
    if (filteredArticles.length === 0) {
      setSelectedId(null);
      return;
    }
    if (
      selectedId == null ||
      !filteredArticles.some((article) => sameArticleId(article.id, selectedId))
    ) {
      setSelectedId(filteredArticles[0].id);
    }
  }, [filteredArticles, selectedId]);

  const selectedArticle =
    selectedId == null
      ? null
      : (filteredArticles.find((article) =>
          sameArticleId(article.id, selectedId),
        ) ?? null);
  const selectedSummary = selectedArticle
    ? summaries.get(selectedArticle.id)
    : undefined;
  const selectedSummaryLoading =
    selectedArticle != null &&
    summaryQueries.some(
      (query, index) =>
        articles[index]?.id === selectedArticle.id && query.isLoading,
    );

  const pageStats = useMemo(() => {
    let responses = 0;
    let withFeedback = 0;
    let percentageSum = 0;
    let percentageCount = 0;

    for (const article of articles) {
      const summary = summaries.get(article.id);
      if (!summary?.count) continue;
      responses += summary.count;
      withFeedback += 1;
      if (summary.overall.percentage != null) {
        percentageSum += summary.overall.percentage;
        percentageCount += 1;
      }
    }

    return {
      responses,
      withFeedback,
      averageTrust:
        percentageCount > 0
          ? Math.round(percentageSum / percentageCount)
          : null,
    };
  }, [articles, summaries]);

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    setParams(next);
  };

  return (
    <div className="content-ratings-page">
      <header className="content-ratings-hero">
        <div className="content-ratings-hero__intro">
          <p className="content-ratings-hero__kicker">الثقة والملاحظات</p>
          <h1 className="content-ratings-hero__title">تقييمات المحتوى</h1>
          <p className="content-ratings-hero__lead">
            استجابات القرّاء على المقالات المنشورة — اختر مقالاً لعرض جدول
            الاستجابات التفصيلي.
          </p>
        </div>

        <div className="content-ratings-hero__stats">
          <div className="content-ratings-stat">
            <span className="content-ratings-stat__value">
              {pageStats.responses}
            </span>
            <span className="content-ratings-stat__label">استجابة في الصفحة</span>
          </div>
          <div className="content-ratings-stat">
            <span className="content-ratings-stat__value">
              {pageStats.averageTrust != null
                ? `${pageStats.averageTrust}%`
                : "—"}
            </span>
            <span className="content-ratings-stat__label">متوسط الثقة</span>
          </div>
          <div className="content-ratings-stat">
            <span className="content-ratings-stat__value">
              {pageStats.withFeedback}/{articles.length || 0}
            </span>
            <span className="content-ratings-stat__label">مقالات بملاحظات</span>
          </div>
        </div>
      </header>

      {isLoading ? (
        <AdminLoadingState variant="table" />
      ) : isError ? (
        <p className="content-ratings-page__error">{getApiErrorMessage(error)}</p>
      ) : articles.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title="لا توجد مقالات منشورة"
          description="ستظهر هنا استجابات القرّاء على المقالات بعد نشرها."
        />
      ) : (
        <>
          <div className="content-ratings-toolbar">
            <label className="content-ratings-search">
              <Search aria-hidden className="size-4" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بعنوان المقال…"
                className="content-ratings-search__input"
              />
            </label>
          </div>

          {filteredArticles.length === 0 ? (
            <AdminEmptyState
              icon={Search}
              title="لا توجد نتائج"
              description="جرّب عنواناً مختلفاً للبحث."
            />
          ) : (
            <div className="content-ratings-layout">
              <aside className="content-ratings-sidebar" aria-label="قائمة المقالات">
                <div className="content-ratings-sidebar__list">
                  {filteredArticles.map((article) => (
                    <ContentRatingsSidebarItem
                      key={article.id}
                      article={article}
                      summary={summaries.get(article.id)}
                      selected={
                        selectedId != null &&
                        sameArticleId(article.id, selectedId)
                      }
                      onSelect={() => setSelectedId(article.id)}
                    />
                  ))}
                </div>
                {!search.trim() ? (
                  <div className="content-ratings-page__pagination">
                    <AdminPagination
                      currentPage={currentPage}
                      lastPage={lastPage}
                      total={total}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      label="صفحات المقالات"
                    />
                  </div>
                ) : null}
              </aside>

              {selectedArticle ? (
                <ContentRatingsDetailPanel
                  article={selectedArticle}
                  summary={selectedSummary}
                  summaryLoading={selectedSummaryLoading}
                />
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
