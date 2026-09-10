import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { getApiErrorMessage } from "@/lib/api-data";
import { AdminAnalytics_APIs } from "@/services/api/admin";
import type { AdminAnalytics, AdminAnalyticsRange } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { useRef, useState } from "react";
import {
  formatCount,
  formatSessionDuration,
  mapCountries,
  mapDevices,
  mapReferrers,
  // mapTopArticles,
} from "./analytics-mappers";
import {
  // AnalyticsArticleRanks,
  AnalyticsCountryLollipops,
  AnalyticsDeviceBubbles,
  AnalyticsReferrerDonut,
} from "./analytics-visuals";

const RANGE_OPTIONS: { value: AdminAnalyticsRange; label: string; hint: string }[] =
  [
    { value: "today", label: "اليوم", hint: "اليوم" },
    { value: "3days", label: "٣ أيام", hint: "آخر ٣ أيام" },
    { value: "7days", label: "٧ أيام", hint: "آخر ٧ أيام" },
    { value: "30days", label: "٣٠ يوماً", hint: "آخر ٣٠ يوماً" },
    { value: "90days", label: "٩٠ يوماً", hint: "آخر ٩٠ يوماً" },
    { value: "month", label: "الشهر الماضي", hint: "الشهر التقويمي السابق" },
    { value: "year", label: "السنة الماضية", hint: "آخر سنة" },
  ];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AdminAnalyticsRange>("today");
  const lastGood = useRef<AdminAnalytics | null>(null);
  const selectedRange =
    RANGE_OPTIONS.find((option) => option.value === range) ?? RANGE_OPTIONS[0];

  const { data, isLoading, isError, error, isFetching, dataUpdatedAt } =
    useQuery({
      queryKey: ["admin-analytics", range],
      queryFn: () => AdminAnalytics_APIs.get(range),
      staleTime: 5 * 60_000,
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
      placeholderData: keepPreviousData,
    });

  if (data) lastGood.current = data;
  const analytics = data ?? lastGood.current;

  if (isLoading && !analytics) {
    return <AdminLoadingState variant="dashboard" />;
  }

  if (!analytics) {
    return (
      <AdminEmptyState
        icon={BarChart3}
        title="تعذّر تحميل تحليلات الموقع"
        description="التحليلات غير متاحة مؤقتاً. تحقق من الاتصال أو صلاحيات Google Analytics ثم أعد المحاولة."
      />
    );
  }
  // const topArticles = mapTopArticles(analytics.top_pages ?? []);
  const referrers = mapReferrers(analytics.referrers ?? []);
  const devices = mapDevices(analytics.devices ?? []).map((item) => ({
    name: item.name,
    value: item.value,
  }));
  const countries = mapCountries(analytics.countries ?? []);
  const today = analytics.summary ?? analytics.today ?? {
    visitors: 0,
    pageviews: 0,
    sessions: 0,
    avg_session_duration_secs: 0,
  };

  return (
    <div className="analytics-page">
      <header className="analytics-page__header">
        <h1 className="analytics-page__title">تحليلات الموقع</h1>
        <div className="analytics-page__toolbar">
          <div className="analytics-ranges" role="group" aria-label="نطاق التاريخ">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="analytics-range"
                data-active={option.value === range}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="analytics-page__stamp">
            آخر تحديث:{" "}
            {dataUpdatedAt
              ? new Date(dataUpdatedAt).toLocaleTimeString("ar", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "الآن"}
          </p>
        </div>
      </header>

      {isError ? (
        <p className="analytics-page__error" role="alert">
          تعذّر تحميل نطاق «{selectedRange.label}».{" "}
          {getApiErrorMessage(error) ||
            "تحقق من الاتصال أو صلاحيات Google Analytics ثم أعد المحاولة."}
        </p>
      ) : null}

      <div data-fetching={isFetching && !isError ? "true" : "false"}>
      <section className="analytics-stats" aria-label="ملخص الزيارات">
        <div className="analytics-stat" data-tone="red" data-live>
          <span className="analytics-stat__label">
            <span className="analytics-stat__live" aria-hidden />
            المستخدمون الآن
          </span>
          <span className="analytics-stat__hint">آخر ٣٠ دقيقة</span>
          <span className="analytics-stat__value">{formatCount(analytics.realtime ?? 0)}</span>
        </div>
        <div className="analytics-stat" data-tone="rose">
          <span className="analytics-stat__label">الزوار</span>
          <span className="analytics-stat__hint">{selectedRange.hint}</span>
          <span className="analytics-stat__value">{formatCount(today.visitors)}</span>
        </div>
        <div className="analytics-stat" data-tone="blue">
          <span className="analytics-stat__label">المشاهدات</span>
          <span className="analytics-stat__hint">{selectedRange.hint}</span>
          <span className="analytics-stat__value">{formatCount(today.pageviews)}</span>
        </div>
        <div className="analytics-stat" data-tone="teal">
          <span className="analytics-stat__label">الجلسات</span>
          <span className="analytics-stat__hint">{selectedRange.hint}</span>
          <span className="analytics-stat__value">{formatCount(today.sessions)}</span>
        </div>
        <div className="analytics-stat" data-tone="orange">
          <span className="analytics-stat__label">متوسط مدة الجلسة</span>
          <span className="analytics-stat__hint">{selectedRange.hint}</span>
          <span className="analytics-stat__value">
            {formatSessionDuration(today.avg_session_duration_secs)}
          </span>
        </div>
      </section>

      <p className="analytics-section-label">التفاصيل</p>
      <section className="analytics-breakdown">
        {/* <AnalyticsArticleRanks rows={topArticles} /> */}
        <AnalyticsReferrerDonut items={referrers} />
        <AnalyticsDeviceBubbles items={devices} />
        <AnalyticsCountryLollipops items={countries} />
      </section>
      </div>
    </div>
  );
}
