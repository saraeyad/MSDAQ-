import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminPanel } from "@/features/admin/components/AdminPanel";
import { getDefaultDateRange, isAllDatesRange } from "@/components/ui/date-range-filter";
import { TrustIndexDateFilter } from "@/features/trust-index/components/TrustIndexDateFilter";
import { TrustCategoryFilter } from "@/features/trust-index/components/TrustCategoryFilter";
import { TrustIndexSummaryPanel } from "@/features/trust-index/components/TrustIndexSummaryPanel";
import { usePublicCategories } from "@/hooks/usePublicCategories";
import { getApiErrorMessage } from "@/lib/api-data";
import { TrustIndex_APIs } from "@/services/api/trust-index";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function TrustIndexPlatformPage() {
  const defaultRange = getDefaultDateRange();
  const [draftDates, setDraftDates] = useState(defaultRange);
  const [appliedDates, setAppliedDates] = useState(defaultRange);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const hasActiveFilter = !isAllDatesRange(appliedDates);

  const categoriesQuery = usePublicCategories();

  const flatCategories = useMemo(() => {
    const rows: { id: number; label: string }[] = [];
    for (const category of categoriesQuery.data ?? []) {
      rows.push({ id: category.id, label: category.name_ar });
      for (const child of category.children ?? []) {
        rows.push({ id: child.id, label: `— ${child.name_ar}` });
      }
    }
    return rows;
  }, [categoriesQuery.data]);

  const summaryQuery = useQuery({
    queryKey: [
      "trust-index-platform-summary",
      appliedDates.start,
      appliedDates.end,
      selectedCategories,
    ],
    queryFn: () =>
      TrustIndex_APIs.platformSummary({
        start: hasActiveFilter ? appliedDates.start : undefined,
        end: hasActiveFilter ? appliedDates.end : undefined,
        categories: selectedCategories.length ? selectedCategories : undefined,
      }),
  });

  const applyDates = () => setAppliedDates(draftDates);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  const selectAllCategories = () => setSelectedCategories([]);

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
            flatCategories.length > 0 ? (
              <TrustCategoryFilter
                categories={flatCategories}
                selectedIds={selectedCategories}
                onToggle={toggleCategory}
                onSelectAll={selectAllCategories}
                disabled={summaryQuery.isFetching}
              />
            ) : null
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
