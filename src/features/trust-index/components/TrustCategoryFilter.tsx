import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  categoryFilterKey,
  categoryFilterLabel,
  findParentCategory,
} from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";

type TrustFilterCategory = {
  id?: number | string | null;
  slug: string;
  name_ar: string;
  children?: TrustFilterCategory[];
};

interface TrustCategoryFilterProps {
  categories: TrustFilterCategory[];
  value: string;
  onChange: (categoryKey: string | null) => void;
  disabled?: boolean;
}

export function TrustCategoryFilter({
  categories,
  value,
  onChange,
  disabled = false,
}: TrustCategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const selectedLabel = useMemo(
    () => categoryFilterLabel(categories, value),
    [categories, value],
  );

  if (categories.length === 0) return null;

  const pick = (key: string | null) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          const parent = findParentCategory(categories, value);
          setExpanded(parent ? categoryFilterKey(parent) : null);
        }
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "trust-cat-picker__trigger",
          value && "trust-cat-picker__trigger--active",
        )}
      >
        <span className="trust-cat-picker__value">{selectedLabel}</span>
        <ChevronDown className="trust-cat-picker__chevron" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        className="trust-cat-picker__panel w-56! max-w-none p-1"
      >
        <button
          type="button"
          className={cn(
            "trust-cat-picker__row",
            !value && "trust-cat-picker__row--active",
          )}
          onClick={() => pick(null)}
        >
          كل التصنيفات
        </button>

        <div className="trust-cat-picker__list">
          {categories.map((parent) => {
            const parentKey = categoryFilterKey(parent);
            const children = parent.children ?? [];
            const isOpen = expanded === parentKey;
            const parentActive = parentKey === value;
            const childActive = children.some(
              (child) => categoryFilterKey(child) === value,
            );

            return (
              <div key={parentKey} className="trust-cat-picker__item">
                <div
                  className={cn(
                    "trust-cat-picker__parent-row",
                    (parentActive || (childActive && !isOpen)) &&
                      "trust-cat-picker__row--active",
                  )}
                >
                  <button
                    type="button"
                    className="trust-cat-picker__row trust-cat-picker__row--parent"
                    onClick={() => pick(parentKey)}
                  >
                    {parent.name_ar}
                  </button>
                  {children.length > 0 ? (
                    <button
                      type="button"
                      className="trust-cat-picker__expand"
                      aria-expanded={isOpen}
                      aria-label={isOpen ? "إخفاء التصنيفات الفرعية" : "عرض التصنيفات الفرعية"}
                      onClick={() =>
                        setExpanded((current) =>
                          current === parentKey ? null : parentKey,
                        )
                      }
                    >
                      {isOpen ? (
                        <ChevronDown aria-hidden />
                      ) : (
                        <ChevronLeft aria-hidden />
                      )}
                    </button>
                  ) : null}
                </div>

                {isOpen && children.length > 0 ? (
                  <div className="trust-cat-picker__children">
                    {children.map((child) => {
                      const childKey = categoryFilterKey(child);
                      return (
                        <button
                          key={childKey}
                          type="button"
                          className={cn(
                            "trust-cat-picker__row trust-cat-picker__row--child",
                            childKey === value && "trust-cat-picker__row--active",
                          )}
                          onClick={() => pick(childKey)}
                        >
                          {child.name_ar}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
