import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import { formatCount } from "./analytics-mappers";

interface AnalyticsRealtimeCardProps {
  count: number;
}

export function AnalyticsRealtimeCard({ count }: AnalyticsRealtimeCardProps) {
  return (
    <div className={cn("admin-kpi-card admin-kpi-card--teal sm:col-span-2 xl:col-span-1")}>
      <div className="admin-kpi-card__top">
        <div className="min-w-0">
          <p className="admin-kpi-card__title">المستخدمون الآن</p>
          <p className="admin-kpi-card__subtitle">آخر 30 دقيقة</p>
        </div>
        <span className="admin-kpi-card__icon">
          <Activity className="size-4" strokeWidth={1.75} />
        </span>
      </div>
      <p className="admin-kpi-card__value">{formatCount(count)}</p>
    </div>
  );
}
