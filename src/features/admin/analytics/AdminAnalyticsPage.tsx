import { AdminEmptyState } from "@/features/admin/components/AdminEmptyState";
import { AdminLoadingState } from "@/features/admin/components/AdminLoadingState";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { DonutChartCard } from "@/features/admin/dashboard/components/DonutChartCard";
import { DashboardMetric } from "@/features/admin/dashboard/components/DashboardMetric";
import { HorizontalBarChartCard } from "@/features/admin/dashboard/components/HorizontalBarChartCard";
import { AdminAnalytics_APIs } from "@/services/api/admin";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Clock, Eye, MousePointerClick, Users } from "lucide-react";
import {
  formatCount,
  formatSessionDuration,
  mapCountries,
  mapDevices,
  mapReferrers,
  mapTopPages,
} from "./analytics-mappers";
import { AnalyticsPagesTable } from "./AnalyticsPagesTable";
import { AnalyticsRealtimeCard } from "./AnalyticsRealtimeCard";

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
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

  const topPages = mapTopPages(data.top_pages);
  const referrers = mapReferrers(data.referrers);
  const devices = mapDevices(data.devices);
  const countries = mapCountries(data.countries);
  const { today } = data;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="تحليلات الموقع"
        description="حركة الزوار على الموقع العام — بيانات اليوم مع تحديث لحظي كل 30 ثانية"
      />

      <section className="space-y-3">
        <h3 className="admin-section-title">الوقت الفعلي</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AnalyticsRealtimeCard count={data.realtime} />
          <DashboardMetric
            label="الزوار"
            subtitle="اليوم"
            value={formatCount(today.visitors)}
            icon={Users}
            tone="blue"
          />
          <DashboardMetric
            label="المشاهدات"
            subtitle="اليوم"
            value={formatCount(today.pageviews)}
            icon={Eye}
            tone="teal"
          />
          <DashboardMetric
            label="الجلسات"
            subtitle="اليوم"
            value={formatCount(today.sessions)}
            icon={MousePointerClick}
            tone="orange"
          />
          <DashboardMetric
            label="متوسط مدة الجلسة"
            subtitle="اليوم"
            value={formatSessionDuration(today.avg_session_duration_secs)}
            icon={Clock}
            tone="slate"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="admin-section-title">التفاصيل</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <AnalyticsPagesTable rows={topPages} />
          <HorizontalBarChartCard
            title="مصادر الزيارات"
            subtitle="حسب الجلسات"
            data={referrers}
            emptyMessage="لا بيانات بعد."
          />
          <DonutChartCard
            title="الأجهزة"
            subtitle="حسب نوع الجهاز"
            data={devices}
            emptyMessage="لا بيانات بعد."
          />
          <HorizontalBarChartCard
            title="الدول"
            subtitle="حسب الجلسات"
            data={countries}
            emptyMessage="لا بيانات بعد."
          />
        </div>
      </section>
    </div>
  );
}
