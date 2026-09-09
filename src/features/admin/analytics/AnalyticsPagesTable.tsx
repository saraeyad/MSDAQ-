import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardChartCard } from "@/features/admin/dashboard/components/DashboardChartCard";
import { formatCount } from "./analytics-mappers";
import type { AnalyticsPageRow } from "./analytics-mappers";

interface AnalyticsPagesTableProps {
  rows: AnalyticsPageRow[];
}

export function AnalyticsPagesTable({ rows }: AnalyticsPagesTableProps) {
  return (
    <DashboardChartCard
      title="الصفحات والشاشات"
      subtitle="أكثر الصفحات زيارة اليوم"
    >
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          لا بيانات بعد.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصفحة</TableHead>
              <TableHead className="w-28 text-start">المشاهدات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.path}-${row.label}`}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.label}</p>
                    {row.label !== row.path ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {row.path}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-start tabular-nums">
                  {formatCount(row.views)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardChartCard>
  );
}
