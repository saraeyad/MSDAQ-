import { paginationItems } from "@/lib/table-pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminPagination({
  currentPage,
  lastPage,
  total,
  pageSize,
  onPageChange,
  label = "صفحات الجدول",
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (lastPage <= 1 || total === 0) return null;

  const rangeFrom = (currentPage - 1) * pageSize + 1;
  const rangeTo = Math.min(currentPage * pageSize, total);

  return (
    <div className="admin-pagination">
      <p className="admin-pagination__meta">
        عرض <strong>{rangeFrom}–{rangeTo}</strong> من <strong>{total}</strong>
      </p>
      <nav className="admin-pagination__nav" aria-label={label}>
        <button
          type="button"
          className="admin-pagination__arrow"
          disabled={currentPage <= 1}
          aria-label="الصفحة السابقة"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronRight />
        </button>
        {paginationItems(currentPage, lastPage).map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} className="admin-pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className="admin-pagination__page"
              aria-current={item === currentPage ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="admin-pagination__arrow"
          disabled={currentPage >= lastPage}
          aria-label="الصفحة التالية"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronLeft />
        </button>
      </nav>
    </div>
  );
}
