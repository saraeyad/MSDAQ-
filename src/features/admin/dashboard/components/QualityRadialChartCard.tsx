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
  const size = 118;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="admin-radial-gauge">
      <svg
        className="admin-radial-gauge__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f5f7fa"
          strokeWidth={stroke}
        />
        {percent > 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </svg>
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
