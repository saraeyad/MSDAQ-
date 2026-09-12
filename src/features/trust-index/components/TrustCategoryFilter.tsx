import { categoryFilterKey } from "@/lib/publishing";
import { cn } from "@/lib/utils";

type TrustFilterCategory = {
  id?: number | string | null;
  slug: string;
  name_ar: string;
  children?: TrustFilterCategory[];
};

interface TrustCategoryFilterProps {
  categories: TrustFilterCategory[];
  value: string[];
  onChange: (categoryKeys: string[]) => void;
  disabled?: boolean;
  variant?: "default" | "header";
}

export function TrustCategoryFilter({
  categories,
  value,
  onChange,
  disabled = false,
  variant = "default",
}: TrustCategoryFilterProps) {
  if (categories.length === 0) return null;

  const selectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const toggle = (key: string) => {
    if (disabled) return;
    onChange(
      value.includes(key)
        ? value.filter((current) => current !== key)
        : [...value, key],
    );
  };

  const isHeader = variant === "header";
  const allActive = value.length === 0;

  return (
    <div
      className={cn(
        "trust-category-tabs",
        isHeader && "trust-category-tabs--header",
      )}
      aria-label="تصفية التصنيفات"
    >
      <div className="trust-category-tabs__list" role="group">
        <button
          type="button"
          aria-pressed={allActive}
          disabled={disabled}
          className={cn(
            "trust-category-tabs__tab",
            allActive && "trust-category-tabs__tab--active",
          )}
          onClick={selectAll}
        >
          الكل
        </button>
        {categories.map((parent) => {
          const parentKey = categoryFilterKey(parent);
          const active = value.includes(parentKey);

          return (
            <button
              key={parentKey}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              className={cn(
                "trust-category-tabs__tab",
                active && "trust-category-tabs__tab--active",
              )}
              onClick={() => toggle(parentKey)}
            >
              {parent.name_ar}
            </button>
          );
        })}
      </div>
      {!isHeader &&
        (value.length > 0 ? (
          <p className="trust-category-tabs__hint">
            {value.length === 1
              ? "تصنيف واحد محدّد — اضغط مرة أخرى لإلغاء التحديد"
              : `${value.length} تصنيفات محدّدة`}
          </p>
        ) : (
          <p className="trust-category-tabs__hint">
            كل التصنيفات — اختر واحداً أو أكثر للتصفية
          </p>
        ))}
    </div>
  );
}
