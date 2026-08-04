import { articleStatusLabel } from "@/lib/media-labels";
import type { AdminDashboardArticles, ArticleStatus } from "@/types";
import { donutColor } from "./components/chart-colors";
import { DonutChartCard } from "./components/DonutChartCard";
import { HorizontalBarChartCard } from "./components/HorizontalBarChartCard";
import { QualityRadialChartCard } from "./components/QualityRadialChartCard";
import { TrendAreaChartCard } from "./components/TrendAreaChartCard";

const STATUS_KEYS: ArticleStatus[] = [
  "published",
  "draft",
  "scheduled",
  "reverted",
];

interface ArticlesSectionProps {
  articles: AdminDashboardArticles;
  days: string;
}

export function ArticlesSection({ articles, days }: ArticlesSectionProps) {
  const statusData = STATUS_KEYS.map((status, index) => ({
    name: articleStatusLabel(status),
    value: articles.by_status[status],
    color: donutColor(index),
  }));

  const categoryData = articles.by_category.map((cat) => ({
    name: cat.name_ar,
    value: cat.count,
  }));

  return (
    <section className="space-y-3">
      <h3 className="admin-section-title">تفصيل المقالات</h3>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <TrendAreaChartCard
            title={`منحنى النشر (${days} يوم)`}
            subtitle="عدد المقالات المنشورة يومياً"
            data={articles.publishing_trend}
          />
        </div>

        <div className="space-y-4 xl:col-span-5">
          <QualityRadialChartCard
            trustScore={articles.quality.avg_trust_score}
            credibilityScore={articles.quality.avg_credibility_score}
          />
          <DonutChartCard
            title="حسب الحالة"
            subtitle="توزيع المقالات حسب حالة النشر"
            data={statusData}
          />
        </div>

        <div className="xl:col-span-12">
          <HorizontalBarChartCard
            title="حسب التصنيف"
            subtitle="المقالات المنشورة لكل تصنيف"
            data={categoryData}
          />
        </div>
      </div>
    </section>
  );
}
