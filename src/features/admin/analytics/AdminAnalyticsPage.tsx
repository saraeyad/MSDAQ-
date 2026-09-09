import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminAnalytics_APIs } from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import {
  formatCount,
  formatSessionDuration,
  mapCountries,
  mapDevices,
  mapReferrers,
  mapTopArticles,
  mapTopPages,
} from "./analytics-mappers";
import {
  AnalyticsArticleRanks,
  AnalyticsCountryLollipops,
  AnalyticsDeviceBubbles,
  AnalyticsReferrerDonut,
  AnalyticsSkyline,
} from "./analytics-visuals";

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => AdminAnalytics_APIs.get(),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <AdminLoadingState variant="dashboard" />;
  }

  if (isError || !data) {
    return (
      <AdminEmptyState
        icon={BarChart3}
        title="تعذّر تحميل تحليلات الموقع"
        description="تحقق من الاتصال أو صلاحيات Google Analytics ثم أعد المحاولة."
      />
    );
  }

  const analytics = data;
  const topPages = mapTopPages(analytics.top_pages ?? []);
  const topArticles = mapTopArticles(analytics.top_pages ?? []);
  const referrers = mapReferrers(analytics.referrers ?? []);
  const devices = mapDevices(analytics.devices ?? []).map((item) => ({
    name: item.name,
    value: item.value,
  }));
  const countries = mapCountries(analytics.countries ?? []);
  const today = analytics.today ?? {
    visitors: 0,
    pageviews: 0,
    sessions: 0,
    avg_session_duration_secs: 0,
  };

  return (
    <div className="analytics-page">
      <header className="analytics-page__header">
        <h1 className="analytics-page__title">تحليلات الموقع</h1>
        <p className="analytics-page__stamp">
          آخر تحديث:{" "}
          {dataUpdatedAt
            ? new Date(dataUpdatedAt).toLocaleTimeString("ar", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "الآن"}
        </p>
      </header>

      <section className="analytics-stats" aria-label="ملخص اليوم">
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
          <span className="analytics-stat__hint">اليوم</span>
          <span className="analytics-stat__value">{formatCount(today.visitors)}</span>
        </div>
        <div className="analytics-stat" data-tone="blue">
          <span className="analytics-stat__label">المشاهدات</span>
          <span className="analytics-stat__hint">اليوم</span>
          <span className="analytics-stat__value">{formatCount(today.pageviews)}</span>
        </div>
        <div className="analytics-stat" data-tone="teal">
          <span className="analytics-stat__label">الجلسات</span>
          <span className="analytics-stat__hint">اليوم</span>
          <span className="analytics-stat__value">{formatCount(today.sessions)}</span>
        </div>
        <div className="analytics-stat" data-tone="orange">
          <span className="analytics-stat__label">متوسط مدة الجلسة</span>
          <span className="analytics-stat__hint">اليوم</span>
          <span className="analytics-stat__value">
            {formatSessionDuration(today.avg_session_duration_secs)}
          </span>
        </div>
      </section>

      <section className="analytics-articles" aria-label="الصفحات والشاشات">
        <AnalyticsSkyline rows={topPages} />
      </section>

      <p className="analytics-section-label">التفاصيل</p>
      <section className="analytics-breakdown">
        <AnalyticsArticleRanks rows={topArticles} />
        <AnalyticsReferrerDonut items={referrers} />
        <AnalyticsDeviceBubbles items={devices} />
        <AnalyticsCountryLollipops items={countries} />
      </section>
    </div>
  );
}
