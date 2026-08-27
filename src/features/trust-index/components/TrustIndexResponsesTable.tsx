import { AdminPagination } from "@/features/admin/components/AdminPagination";
import { TrustResponseDimensionsCell } from "@/features/trust-index/components/TrustResponseDimensionsCell";
import {
  TRUST_DIMENSIONS,
  type TrustDimensionDefinition,
} from "@/lib/trust-index-labels";
import { trustBandClass, trustBandLabel } from "@/lib/trust-index-labels";
import type { TrustIndexResponseRow } from "@/types";

interface TrustIndexResponsesTableProps {
  items: TrustIndexResponseRow[];
  currentPage: number;
  lastPage: number;
  total: number;
  pageSize: number;
  hasDateFilter?: boolean;
  dimensions?: readonly TrustDimensionDefinition[];
  onPageChange: (page: number) => void;
}

export function TrustIndexResponsesTable({
  items,
  currentPage,
  lastPage,
  total,
  pageSize,
  hasDateFilter = false,
  dimensions = TRUST_DIMENSIONS,
  onPageChange,
}: TrustIndexResponsesTableProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {hasDateFilter
          ? "لا توجد استجابات في هذه الفترة."
          : "لا توجد استجابات بعد."}
      </p>
    );
  }

  return (
    <div className="trust-responses">
      <div className="trust-responses__table-wrap">
        <table className="trust-responses__table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المؤشر</th>
              <th>التقييم التفصيلي</th>
              <th>ملاحظة</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.created_at).toLocaleString("ar")}</td>
                <td>
                  <span className={`trust-band-pill ${trustBandClass(row.trust_level)}`}>
                    {row.trust_percentage}% · {trustBandLabel(row.trust_level)}
                  </span>
                </td>
                <td className="trust-responses__dimensions">
                  <TrustResponseDimensionsCell
                    scores={row.scores}
                    dimensions={dimensions}
                  />
                </td>
                <td>{row.comment?.trim() || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        currentPage={currentPage}
        lastPage={lastPage}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        label="صفحات الاستجابات"
      />
    </div>
  );
}
