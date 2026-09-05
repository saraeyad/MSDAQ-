import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { getDefaultDateRange, isAllDatesRange } from "@/components/ui/date-range-filter";
import { TrustIndexDateFilter } from "@/features/trust-index/components/TrustIndexDateFilter";
import { TrustCategoryFilter } from "@/features/trust-index/components/TrustCategoryFilter";
import { TrustIndexSummaryPanel } from "@/features/trust-index/components/TrustIndexSummaryPanel";
import { getApiErrorMessage } from "@/lib/api-data";
import {
  collectCategoryIntegerIds,
  findCategoryByFilterKey,
} from "@/lib/category-tree";
import { Categories_APIs } from "@/services/api/categories";
import { TrustIndex_APIs } from "@/services/api/trust-index";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function TrustIndexPlatformPage() {
  const defaultRange = getDefaultDateRange();
  const [draftDates, setDraftDates] = useState(defaultRange);
  const [appliedDates, setAppliedDates] = useState(defaultRange);
  const [selectedCategory, setSelectedCategory] = useState("");

  const hasActiveFilter = !isAllDatesRange(appliedDates);

  const categoriesQuery = useQuery({
    queryKey: ["staff-categories"],
    queryFn: () => Categories_APIs.list(),
  });
  const categories = categoriesQuery.data ?? [];

  const categoryParams = useMemo(() => {
    if (!selectedCategory) return undefined;
    const selected = findCategoryByFilterKey(categories, selectedCategory);
    if (!selected) return undefined;
    const ids = collectCategoryIntegerIds(selected);
    return ids.length ? ids : undefined;
  }, [categories, selectedCategory]);

  const summaryQuery = useQuery({
    queryKey: [
      "trust-index-platform-summary",
      appliedDates.start,
      appliedDates.end,
      selectedCategory,
    ],
    queryFn: () =>
      TrustIndex_APIs.platformSummary({
        start: hasActiveFilter ? appliedDates.start : undefined,
        end: hasActiveFilter ? appliedDates.end : undefined,
        categories: categoryParams,
      }),
  });

  const applyDates = () => setAppliedDates(draftDates);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="مؤشر ثقة الجمهور" />

      <div className="admin-date-toolbar">
        <TrustIndexDateFilter
          value={draftDates}
          onChange={setDraftDates}
          onApply={applyDates}
          disabled={summaryQuery.isFetching}
        />
      </div>

      {summaryQuery.isError ? (
        <AdminPanel accent="warning">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(summaryQuery.error)}
          </p>
        </AdminPanel>
      ) : (
        <AdminPanel
          title="الملخص"
          headerActions={
            <TrustCategoryFilter
              categories={categories}
              value={selectedCategory}
              onChange={(next) => setSelectedCategory(next ?? "")}
              disabled={summaryQuery.isFetching}
            />
          }
        >
          {summaryQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">جاري تحميل النتائج...</p>
          ) : summaryQuery.data && summaryQuery.data.count === 0 ? (
            <div className="trust-summary-panel trust-summary-panel--empty">
              لا توجد بيانات كافية — جرّب توسيع نطاق التاريخ أو إزالة فلاتر التصنيف.
            </div>
          ) : (
            <TrustIndexSummaryPanel summary={summaryQuery.data} />
          )}
        </AdminPanel>
      )}
    </div>
  );
}
