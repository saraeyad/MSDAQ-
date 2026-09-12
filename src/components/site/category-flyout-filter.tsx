import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryFilterKey, categoryFilterLabel } from "@/lib/publishing";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useMemo, useState, type PointerEvent } from "react";

type FlyoutCategory = {
  id?: number | string | null;
  slug: string;
  name_ar: string;
  children?: FlyoutCategory[];
};

/** Radix dismisses on pointerdown; preventDefault also cancels click, so select here. */
function selectOnPointerDown(event: PointerEvent, onSelect: () => void) {
  event.preventDefault();
  onSelect();
}

function CategoryFilterFlyoutRow({
  category,
  value,
  onSelect,
  flyoutPlacement = "outward",
}: {
  category: FlyoutCategory;
  value: string;
  onSelect: (categoryId: string) => void;
  flyoutPlacement?: "outward" | "inward";
}) {
  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const parentKey = categoryFilterKey(category);
  const parentSelected = parentKey === value;
  const branchSelected = children.some(
    (child) => categoryFilterKey(child) === value,
  );

  if (!hasChildren) {
    return (
      <DropdownMenuItem
        className={cn(parentSelected && "text-primary font-medium")}
        onSelect={() => onSelect(parentKey)}
      >
        {category.name_ar}
      </DropdownMenuItem>
    );
  }

  return (
    <div className="site-nav-parent-row">
      <button
        type="button"
        className={cn(
          "site-nav-parent-link site-nav-parent-link--has-children",
          flyoutPlacement === "inward" && "site-nav-parent-link--flyout-inward",
          (parentSelected || branchSelected) && "site-nav-parent-link--active",
        )}
        onPointerDown={(event) =>
          selectOnPointerDown(event, () => onSelect(parentKey))
        }
      >
        <span className="site-nav-parent-link__label">{category.name_ar}</span>
        <ChevronLeft className="site-nav-parent-link__chevron" aria-hidden />
      </button>
      <div
        className={cn(
          "site-nav-flyout",
          flyoutPlacement === "inward" && "site-nav-flyout--inward",
        )}
        role="menu"
        aria-label={`${category.name_ar} — تصنيفات فرعية`}
      >
        <p className="site-nav-flyout__heading">{category.name_ar}</p>
        <ul className="site-nav-flyout__list">
          {children.map((child) => {
            const childKey = categoryFilterKey(child);
            const active = childKey === value;
            return (
              <li key={childKey}>
                <button
                  type="button"
                  role="menuitem"
                  className={cn(
                    "site-nav-flyout__link",
                    active && "site-nav-flyout__link--active",
                  )}
                  onPointerDown={(event) =>
                    selectOnPointerDown(event, () => onSelect(childKey))
                  }
                >
                  <span className="site-nav-flyout__bullet" aria-hidden />
                  <span className="site-nav-flyout__label">
                    {child.name_ar}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export interface CategoryFlyoutFilterProps {
  categories: FlyoutCategory[];
  value: string;
  onChange: (categoryId: string | null) => void;
  className?: string;
  triggerClassName?: string;
  emptyLabel?: string;
  allOptionLabel?: string;
  showAllOption?: boolean;
  disabled?: boolean;
  loading?: boolean;
  flyoutPlacement?: "outward" | "inward";
  menuAlign?: "start" | "center" | "end";
  menuClassName?: string;
}

export function CategoryFlyoutFilter({
  categories,
  value,
  onChange,
  className,
  triggerClassName,
  emptyLabel = "كل التصنيفات",
  allOptionLabel = "كل التصنيفات",
  showAllOption = true,
  disabled = false,
  loading = false,
  flyoutPlacement = "outward",
  menuAlign = "start",
  menuClassName,
}: CategoryFlyoutFilterProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => categoryFilterLabel(categories, value, emptyLabel),
    [categories, emptyLabel, value],
  );

  const handleSelect = (categoryId: string | null) => {
    onChange(categoryId);
    setOpen(false);
  };

  const isDisabled = disabled || loading;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        disabled={isDisabled}
        className={cn("newsroom-category-filter", className, triggerClassName)}
      >
        <span className="newsroom-category-filter__label">
          {loading ? "جاري التحميل..." : selectedLabel}
        </span>
        <ChevronDown
          className="newsroom-category-filter__chevron"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={menuAlign}
        sideOffset={6}
        className={cn(
          "site-nav-dropdown min-w-44 overflow-visible",
          flyoutPlacement === "inward" && "category-flyout--inward",
          menuClassName,
        )}
      >
        {showAllOption ? (
          <DropdownMenuItem
            className={cn(!value && "text-primary font-medium")}
            onSelect={(event) => {
              event.preventDefault();
              handleSelect(null);
            }}
          >
            {allOptionLabel}
          </DropdownMenuItem>
        ) : null}
        {categories.map((category) => (
          <CategoryFilterFlyoutRow
            key={categoryFilterKey(category)}
            category={category}
            value={value}
            flyoutPlacement={flyoutPlacement}
            onSelect={(categoryId) => handleSelect(categoryId)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
