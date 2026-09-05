import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryFilterKey, categoryFilterLabel } from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import type { PublicCategory } from "@/types";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";

function CategoryFilterFlyoutRow({
  category,
  value,
  onSelect,
}: {
  category: PublicCategory;
  value: string;
  onSelect: (categoryId: string) => void;
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
        onSelect={(event) => {
          event.preventDefault();
          onSelect(parentKey);
        }}
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
          (parentSelected || branchSelected) && "site-nav-parent-link--active",
        )}
        onClick={() => onSelect(parentKey)}
      >
        <span className="site-nav-parent-link__label">{category.name_ar}</span>
        <ChevronLeft className="site-nav-parent-link__chevron" aria-hidden />
      </button>
      <div
        className="site-nav-flyout"
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
                  onClick={() => onSelect(childKey)}
                >
                  <span className="site-nav-flyout__bullet" aria-hidden />
                  <span className="site-nav-flyout__label">{child.name_ar}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function CategoryFlyoutFilter({
  categories,
  value,
  onChange,
  className,
}: {
  categories: PublicCategory[];
  value: string;
  onChange: (categoryId: string | null) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => categoryFilterLabel(categories, value),
    [categories, value],
  );

  const handleSelect = (categoryId: string | null) => {
    onChange(categoryId);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        className={cn("newsroom-category-filter", className)}
      >
        <span className="newsroom-category-filter__label">{selectedLabel}</span>
        <ChevronDown className="newsroom-category-filter__chevron" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="site-nav-dropdown min-w-44 overflow-visible"
      >
        <DropdownMenuItem
          className={cn(!value && "text-primary font-medium")}
          onSelect={(event) => {
            event.preventDefault();
            handleSelect(null);
          }}
        >
          كل التصنيفات
        </DropdownMenuItem>
        {categories.map((category) => (
          <CategoryFilterFlyoutRow
            key={categoryFilterKey(category)}
            category={category}
            value={value}
            onSelect={handleSelect}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
