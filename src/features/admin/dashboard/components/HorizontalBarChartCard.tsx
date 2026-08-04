import { chartColor } from "./chart-colors";
import { DashboardChartCard } from "./DashboardChartCard";

export interface HorizontalBarChartItem {
  name: string;
  value: number;
}

interface HorizontalBarChartCardProps {
  title: string;
  subtitle?: string;
  data: HorizontalBarChartItem[];
  emptyMessage?: string;
}

export function HorizontalBarChartCard({
  title,
  subtitle = "طول الشريط = العدد",
  data,
  emptyMessage = "لا بيانات.",
}: HorizontalBarChartCardProps) {
  const chartData = [...data]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const max = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <DashboardChartCard title={title} subtitle={subtitle}>
      {chartData.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="admin-source-bars">
          {chartData.map((item, index) => {
            const width = Math.max(6, (item.value / max) * 100);
            const color = chartColor(index);

            return (
              <div key={item.name} className="admin-source-bar">
                <div className="admin-source-bar__head">
                  <span className="admin-source-bar__name">{item.name}</span>
                  <span className="admin-source-bar__count">{item.value}</span>
                </div>
                <div className="admin-source-bar__track">
                  <div
                    className="admin-source-bar__fill"
                    style={{ width: `${width}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardChartCard>
  );
}
