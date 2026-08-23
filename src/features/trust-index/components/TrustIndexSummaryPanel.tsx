import { DonutChartCard } from "@/features/admin/dashboard/components/DonutChartCard";
import { VerticalBarChartCard } from "@/features/admin/dashboard/components/VerticalBarChartCard";
import { DASHBOARD_PALETTE } from "@/features/admin/dashboard/components/chart-colors";
import {
  formatTrustAverage,
  formatTrustPercentage,
  TRUST_BAND_LABELS,
  TRUST_DIMENSIONS,
  trustBandClass,
  trustBandLabel,
  trustIndexHasData,
} from "@/lib/trust-index-labels";
import type { TrustIndexSummary } from "@/types";

interface TrustIndexSummaryPanelProps {
  summary: TrustIndexSummary | undefined;
  isLoading?: boolean;
}

function DistributionBars({
  title,
  distribution,
}: {
  title: string;
  distribution: number[];
}) {
  const max = Math.max(...distribution, 1);

  return (
    <div className="trust-distribution">
      <p className="trust-distribution__title">{title}</p>
      <p className="trust-distribution__hint">عدد من اختار ١ · ٢ · ٣ · ٤ · ٥</p>
      <div className="trust-distribution__rows">
        {distribution.map((count, index) => {
          const score = index + 1;
          const width = Math.max(count > 0 ? 8 : 0, (count / max) * 100);

          return (
            <div key={score} className="trust-distribution__item">
              <span className="trust-distribution__score">{score}</span>
              <div className="trust-distribution__track">
                <div
                  className="trust-distribution__fill"
                  data-score={score}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="trust-distribution__count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrustIndexSummaryPanel({
  summary,
  isLoading = false,
}: TrustIndexSummaryPanelProps) {
  if (isLoading) {
    return (
      <div className="trust-summary-panel trust-summary-panel--loading">
        جاري تحميل النتائج...
      </div>
    );
  }

  if (!trustIndexHasData(summary)) {
    return (
      <div className="trust-summary-panel trust-summary-panel--empty">
        لا توجد بيانات كافية
      </div>
    );
  }

  const data = summary!;

  return (
    <div className="trust-summary-panel">
      <div className="trust-summary-kpis">
        <div className="trust-summary-kpi">
          <p className="trust-summary-kpi__label">عدد الاستجابات</p>
          <p className="trust-summary-kpi__value">{data.count}</p>
        </div>
        <div className="trust-summary-kpi">
          <p className="trust-summary-kpi__label">المؤشر العام</p>
          <p className="trust-summary-kpi__value">
            {formatTrustPercentage(data.overall.percentage)}
          </p>
          <p className="trust-summary-kpi__meta">
            متوسط {formatTrustAverage(data.overall.average)} / 5
          </p>
        </div>
        <div className={`trust-summary-kpi ${trustBandClass(data.overall.band)}`}>
          <p className="trust-summary-kpi__label">التصنيف</p>
          <p className="trust-summary-kpi__value">
            {trustBandLabel(data.overall.band)}
          </p>
        </div>
      </div>

      <div className="trust-summary-grid">
        <VerticalBarChartCard
          title="متوسط الأبعاد"
          subtitle="من 5"
          maxValue={5}
          data={TRUST_DIMENSIONS.map((dimension) => ({
            name: dimension.label,
            value: data.dimensions[dimension.key].average ?? 0,
          }))}
        />

        <DonutChartCard
          title="توزيع التصنيفات"
          subtitle="حسب مستوى الثقة"
          data={[
            {
              name: TRUST_BAND_LABELS.low,
              value: data.band_distribution.low,
              color: DASHBOARD_PALETTE.coral,
            },
            {
              name: TRUST_BAND_LABELS.medium,
              value: data.band_distribution.medium,
              color: DASHBOARD_PALETTE.amber,
            },
            {
              name: TRUST_BAND_LABELS.high,
              value: data.band_distribution.high,
              color: DASHBOARD_PALETTE.teal,
            },
          ]}
        />
      </div>

      <div className="trust-summary-distributions-section">
        <header className="trust-summary-distributions__header">
          <h4 className="trust-summary-distributions__heading">توزيع الدرجات</h4>
          <p className="trust-summary-distributions__lead">
            عدد المقيّمين الذين اختاروا ١، ٢، ٣، ٤، أو ٥ — لكل بُعد على حدة
          </p>
        </header>
        <div className="trust-summary-distributions">
          {TRUST_DIMENSIONS.map((dimension) => (
            <DistributionBars
              key={dimension.key}
              title={dimension.label}
              distribution={[...data.dimensions[dimension.key].distribution]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
