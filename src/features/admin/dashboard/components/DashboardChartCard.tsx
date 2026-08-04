import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  accent?: "primary" | "warning" | "none";
  className?: string;
  children: ReactNode;
}

export function DashboardChartCard({
  title,
  subtitle,
  badge,
  accent = "none",
  className,
  children,
}: DashboardChartCardProps) {
  return (
    <div
      className={cn(
        "admin-dash-card",
        accent !== "none" && `admin-dash-card--${accent}`,
        className,
      )}
    >
      <div className="admin-dash-card__header">
        <div className="admin-dash-card__title-row">
          <h4 className="admin-dash-card__title">{title}</h4>
          {badge !== undefined ? (
            <span className="admin-dash-card__badge">{badge}</span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="admin-dash-card__subtitle">{subtitle}</p>
        ) : null}
      </div>
      <div className="admin-dash-card__body">{children}</div>
    </div>
  );
}
