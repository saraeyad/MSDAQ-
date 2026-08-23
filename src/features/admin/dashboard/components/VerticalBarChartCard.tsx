import { chartColor } from "./chart-colors";
import { DashboardChartCard } from "./DashboardChartCard";

interface VerticalBarChartItem {
  name: string;
  value: number;
}

interface VerticalBarChartCardProps {
  title: string;
  subtitle?: string;
  data: VerticalBarChartItem[];
  maxValue?: number;
  emptyMessage?: string;
  formatValue?: (value: number) => string;
}

const DEFAULT_TICKS = [0, 1, 2, 3, 4, 5];

export function VerticalBarChartCard({
  title,
  subtitle,
  data,
  maxValue = 5,
  emptyMessage = "لا بيانات.",
  formatValue = (value) => value.toFixed(1),
}: VerticalBarChartCardProps) {
  const chartData = data.slice(0, 8);

  return (
    <DashboardChartCard title={title} subtitle={subtitle}>
      {chartData.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="admin-vbar-chart" dir="ltr">
          <div className="admin-vbar-chart__y-axis" aria-hidden>
            {DEFAULT_TICKS.filter((tick) => tick <= maxValue)
              .reverse()
              .map((tick) => (
                <span key={tick} className="admin-vbar-chart__tick">
                  {tick}
                </span>
              ))}
          </div>
          <div className="admin-vbar-chart__plot">
            <div className="admin-vbar-chart__grid" aria-hidden>
              {DEFAULT_TICKS.filter((tick) => tick <= maxValue).map((tick) => (
                <div
                  key={tick}
                  className="admin-vbar-chart__gridline"
                  style={{ bottom: `${(tick / maxValue) * 100}%` }}
                />
              ))}
            </div>
            <div className="admin-vbar-chart__bars">
              {chartData.map((item, index) => {
                const height = Math.max(
                  item.value > 0 ? 4 : 0,
                  (item.value / maxValue) * 100,
                );
                const color = chartColor(index);

                return (
                  <div key={item.name} className="admin-vbar-chart__column">
                    <span className="admin-vbar-chart__value">
                      {formatValue(item.value)}
                    </span>
                    <div className="admin-vbar-chart__track">
                      <div
                        className="admin-vbar-chart__fill"
                        style={{
                          height: `${height}%`,
                          background: `linear-gradient(180deg, color-mix(in srgb, ${color} 75%, white), ${color})`,
                        }}
                      />
                    </div>
                    <span className="admin-vbar-chart__label" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardChartCard>
  );
}
