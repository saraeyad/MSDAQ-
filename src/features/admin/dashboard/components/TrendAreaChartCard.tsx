import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltipContent } from "./ChartTooltipContent";
import { DashboardChartCard } from "./DashboardChartCard";
import { DASHBOARD_PALETTE } from "./chart-colors";

export interface TrendChartPoint {
  date: string;
  count: number;
}

interface TrendAreaChartCardProps {
  title: string;
  subtitle?: string;
  data: TrendChartPoint[];
  emptyMessage?: string;
}

function formatAxisDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("ar", { day: "numeric", month: "short" });
}

export function TrendAreaChartCard({
  title,
  subtitle,
  data,
  emptyMessage = "لا بيانات.",
}: TrendAreaChartCardProps) {
  const hasData = data.some((point) => point.count > 0);

  return (
    <DashboardChartCard title={title} subtitle={subtitle}>
      {!hasData ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="admin-trend-chart">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="dashboardTrendFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={DASHBOARD_PALETTE.teal}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor={DASHBOARD_PALETTE.teal}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#eceff3"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.[0]) return null;
                  return (
                    <ChartTooltipContent
                      label={formatAxisDate(String(label))}
                      value={payload[0].value as number}
                      color={DASHBOARD_PALETTE.teal}
                    />
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={DASHBOARD_PALETTE.teal}
                strokeWidth={2}
                fill="url(#dashboardTrendFill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: DASHBOARD_PALETTE.teal,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
