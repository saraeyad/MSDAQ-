import type {
  AdminDashboardOverview,
  AdminDashboardPublishingTrendPoint,
} from "@/types";
import { AlertTriangle, FileText, FileEdit, Users } from "lucide-react";
import { DashboardMetric } from "./components/DashboardMetric";

interface OverviewSectionProps {
  overview: AdminDashboardOverview;
  publishingTrend?: AdminDashboardPublishingTrendPoint[];
}

export function OverviewSection({
  overview,
  publishingTrend = [],
}: OverviewSectionProps) {
  const trendCounts = publishingTrend.map((point) => point.count);
  const needsAttention = overview.pending_consents + overview.reverted;

  return (
    <section className="space-y-3">
      <h3 className="admin-section-title">نظرة عامة</h3>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          label="منشورة"
          subtitle="مقالات منشورة"
          value={overview.published}
          icon={FileText}
          tone="blue"
          sparkline={trendCounts}
        />
        <DashboardMetric
          label="مسودات"
          subtitle="قيد التحرير"
          value={overview.drafts}
          icon={FileEdit}
          tone="teal"
        />
        <DashboardMetric
          label="يحتاج انتباه"
          subtitle="موافقات ومُعادة"
          value={needsAttention}
          icon={AlertTriangle}
          tone="coral"
        />
        <DashboardMetric
          label="المستخدمون"
          subtitle="إجمالي الحسابات"
          value={overview.users_total}
          icon={Users}
          tone="orange"
        />
      </div>
    </section>
  );
}
