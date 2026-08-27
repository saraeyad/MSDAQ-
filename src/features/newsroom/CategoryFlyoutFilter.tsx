import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const parentSelected = String(category.id) === value;
  const branchSelected = children.some(
    (child) => String(child.id) === value,
  );

  if (!hasChildren) {
    return (
      <DropdownMenuItem
        className={cn(parentSelected && "text-primary font-medium")}
        onSelect={(event) => {
          event.preventDefault();
          onSelect(String(category.id));
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
        onClick={() => onSelect(String(category.id))}
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
            const active = String(child.id) === value;
            return (
              <li key={child.id}>
                <button
                  type="button"
                  role="menuitem"
                  className={cn(
                    "site-nav-flyout__link",
                    active && "site-nav-flyout__link--active",
                  )}
                  onClick={() => onSelect(String(child.id))}
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

  const selectedLabel = useMemo(() => {
    if (!value) return "كل التصنيفات";

    for (const parent of categories) {
      if (String(parent.id) === value) return parent.name_ar;
      for (const child of parent.children ?? []) {
        if (String(child.id) === value) return child.name_ar;
      }
    }

    return "كل التصنيفات";
  }, [categories, value]);

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
            key={category.id}
            category={category}
            value={value}
            onSelect={handleSelect}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
