interface TrustCategoryFilterProps {
  categories: { id: number; label: string }[];
  selectedIds: number[];
  onToggle: (categoryId: number) => void;
  onSelectAll: () => void;
  disabled?: boolean;
}

export function TrustCategoryFilter({
  categories,
  selectedIds,
  onToggle,
  onSelectAll,
  disabled = false,
}: TrustCategoryFilterProps) {
  if (categories.length === 0) return null;

  const allSelected = selectedIds.length === 0;

  return (
    <div className="trust-category-filter trust-category-filter--inline">
      <div className="trust-category-filter__chips">
        <button
          type="button"
          disabled={disabled}
          className={`trust-category-filter__chip trust-category-filter__chip--all${allSelected ? " trust-category-filter__chip--active" : ""}`}
          onClick={onSelectAll}
        >
          الكل
        </button>
        {categories.map((category) => {
          const active = selectedIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              disabled={disabled}
              className={`trust-category-filter__chip${active ? " trust-category-filter__chip--active" : ""}`}
              onClick={() => onToggle(category.id)}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
