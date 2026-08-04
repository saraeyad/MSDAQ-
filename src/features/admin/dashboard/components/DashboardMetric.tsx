import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./MiniSparkline";
import { DASHBOARD_PALETTE } from "./chart-colors";

export type MetricTone = "blue" | "teal" | "coral" | "orange" | "slate";

interface DashboardMetricProps {
  label: string;
  subtitle?: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: MetricTone;
  sparkline?: number[];
}

const TONE_SPARKLINE: Record<MetricTone, string> = {
  blue: DASHBOARD_PALETTE.blue,
  teal: DASHBOARD_PALETTE.teal,
  coral: DASHBOARD_PALETTE.coral,
  orange: DASHBOARD_PALETTE.orange,
  slate: DASHBOARD_PALETTE.deepBlue,
};

export function DashboardMetric({
  label,
  subtitle,
  value,
  icon: Icon,
  tone = "blue",
  sparkline,
}: DashboardMetricProps) {
  return (
    <div className={cn("admin-kpi-card", `admin-kpi-card--${tone}`)}>
      <div className="admin-kpi-card__top">
        <div className="min-w-0">
          <p className="admin-kpi-card__title">{label}</p>
          {subtitle ? (
            <p className="admin-kpi-card__subtitle">{subtitle}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className="admin-kpi-card__icon">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>

      <p className="admin-kpi-card__value">{value}</p>

      {sparkline && sparkline.length > 1 ? (
        <MiniSparkline data={sparkline} color={TONE_SPARKLINE[tone]} />
      ) : null}
    </div>
  );
}
