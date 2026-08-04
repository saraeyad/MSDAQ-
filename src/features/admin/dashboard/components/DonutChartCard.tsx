import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltipContent } from "./ChartTooltipContent";
import { DashboardChartCard } from "./DashboardChartCard";

export interface DonutChartItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  data: DonutChartItem[];
  emptyMessage?: string;
}

export function DonutChartCard({
  title,
  subtitle,
  data,
  emptyMessage = "لا بيانات.",
}: DonutChartCardProps) {
  const filtered = data.filter((item) => item.value > 0);
  const total = filtered.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardChartCard title={title} subtitle={subtitle}>
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="admin-donut-chart">
          <div className="admin-donut-chart__canvas">
            <ResponsiveContainer width="100%" height={108}>
              <PieChart>
                <Pie
                  data={filtered}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={26}
                  outerRadius={50}
                  paddingAngle={2}
                  stroke="none"
                >
                  {filtered.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const item = payload[0].payload as DonutChartItem;
                    return (
                      <ChartTooltipContent
                        label={item.name}
                        value={item.value}
                        color={item.color}
                      />
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="admin-donut-chart__legend">
            {filtered.map((item) => (
              <li key={item.name} className="admin-donut-chart__legend-item">
                <span className="admin-donut-chart__legend-left">
                  <span
                    className="admin-donut-chart__legend-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="admin-donut-chart__legend-label">
                    {item.name}
                  </span>
                </span>
                <span className="admin-donut-chart__legend-value">
                  {item.value}
                </span>
              </li>
            ))}
            <li className="admin-donut-chart__legend-total">
              <span>الإجمالي</span>
              <span>{total}</span>
            </li>
          </ul>
        </div>
      )}
    </DashboardChartCard>
  );
}
