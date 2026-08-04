import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { DashboardChartCard } from "./DashboardChartCard";
import { DASHBOARD_PALETTE } from "./chart-colors";
import { formatScore } from "../utils";

interface QualityRadialChartCardProps {
  trustScore: number | null;
  credibilityScore: number | null;
}

function scoreToPercent(score: number | null): number {
  if (score == null || Number.isNaN(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function RadialGauge({
  label,
  score,
  color,
}: {
  label: string;
  score: number | null;
  color: string;
}) {
  const percent = scoreToPercent(score);
  const data = [{ name: label, value: percent, fill: color }];

  return (
    <div className="admin-radial-gauge">
      <ResponsiveContainer width="100%" height={118}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="58%"
          outerRadius="100%"
          barSize={18}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: "#f5f7fa" }}
            dataKey="value"
            cornerRadius={6}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="admin-radial-gauge__label">
        <p className="admin-radial-gauge__value">{formatScore(score)}</p>
        <p className="admin-radial-gauge__name">{label}</p>
      </div>
    </div>
  );
}

export function QualityRadialChartCard({
  trustScore,
  credibilityScore,
}: QualityRadialChartCardProps) {
  return (
    <DashboardChartCard
      title="جودة تحريرية"
      subtitle="متوسط الثقة والمصداقية"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <RadialGauge
          label="متوسط الثقة"
          score={trustScore}
          color={DASHBOARD_PALETTE.orange}
        />
        <RadialGauge
          label="متوسط المصداقية"
          score={credibilityScore}
          color={DASHBOARD_PALETTE.deepBlue}
        />
      </div>
    </DashboardChartCard>
  );
}
