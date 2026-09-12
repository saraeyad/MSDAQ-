import { CategoryFlyoutFilter } from "@/components/site/category-flyout-filter";
import type { Category } from "@/types";

interface PublishCategoryPickerProps {
  categories: Category[];  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PublishCategoryPicker({
  categories,
  value,
  onChange,
  disabled = false,
  loading = false,
}: PublishCategoryPickerProps) {
  return (
    <CategoryFlyoutFilter
      categories={categories}
      value={value}
      onChange={(categoryId) => onChange(categoryId ?? "")}
      showAllOption={false}
      emptyLabel="اختر التصنيف"
      flyoutPlacement="inward"
      menuAlign="end"
      className="publish-category-flyout"
      disabled={disabled}
      loading={loading}
    />
  );
}
