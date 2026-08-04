import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  groupPermissions,
  permissionGroup,
  permissionGroupAccent,
  permissionGroupLabel,
  permissionLabel,
} from "@/lib/permission-labels";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface PermissionPickerProps {
  catalog: string[];
  selected: string[];
  onChange: (perms: string[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function PermissionPicker({
  catalog,
  selected,
  onChange,
  disabled,
  compact,
}: PermissionPickerProps) {
  const [search, setSearch] = useState("");

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (slug) =>
        slug.includes(q) ||
        permissionLabel(slug).toLowerCase().includes(q) ||
        permissionGroupLabel(permissionGroup(slug)).toLowerCase().includes(q),
    );
  }, [catalog, search]);

  const groups = useMemo(
    () => groupPermissions(filteredCatalog),
    [filteredCatalog],
  );

  const toggle = (slug: string) => {
    if (disabled) return;
    onChange(
      selected.includes(slug)
        ? selected.filter((p) => p !== slug)
        : [...selected, slug],
    );
  };

  const selectGroup = (perms: string[]) => {
    if (disabled) return;
    onChange([...new Set([...selected, ...perms])]);
  };

  const clearGroup = (perms: string[]) => {
    if (disabled) return;
    const remove = new Set(perms);
    onChange(selected.filter((p) => !remove.has(p)));
  };

  const selectedInCatalog = selected.filter((p) => catalog.includes(p)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الصلاحيات..."
            className="ps-9"
            disabled={disabled}
          />
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {selectedInCatalog} / {catalog.length} محدّد
        </span>
      </div>

      {/* Explicit responsive columns — category cards side by side */}
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
          compact && "max-h-[28rem] overflow-y-auto pe-1",
        )}
      >
        {[...groups.entries()].map(([groupKey, perms]) => {
          const groupSelected = perms.filter((p) =>
            selected.includes(p),
          ).length;
          const accent = permissionGroupAccent(groupKey);
          const allSelected =
            perms.length > 0 && groupSelected === perms.length;

          return (
            <section
              key={groupKey}
              className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
              style={{ ["--perm-accent" as string]: accent }}
            >
              <header
                className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3"
                style={{
                  borderInlineStart: `3px solid ${accent}`,
                  background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 14%, white) 0%, #fff 72%)`,
                }}
              >
                <div className="min-w-0">
                  <p className="font-headline text-sm font-bold text-foreground">
                    {permissionGroupLabel(groupKey)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {groupSelected}/{perms.length} صلاحية
                  </p>
                </div>
                {!disabled ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-[11px]"
                    onClick={() =>
                      allSelected ? clearGroup(perms) : selectGroup(perms)
                    }
                  >
                    {allSelected ? "إلغاء" : "الكل"}
                  </Button>
                ) : null}
              </header>

              <div className="flex flex-1 flex-col gap-1.5 p-3">
                {perms.map((perm) => {
                  const active = selected.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(perm)}
                      title={perm}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-start transition-colors",
                        active
                          ? "border-transparent text-foreground shadow-sm"
                          : "border-border/70 bg-muted/30 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                      style={
                        active
                          ? {
                              background: `color-mix(in srgb, ${accent} 14%, white)`,
                              borderColor: `color-mix(in srgb, ${accent} 40%, #e5e7eb)`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: active ? accent : "#d1d5db",
                          boxShadow: active
                            ? `0 0 0 3px color-mix(in srgb, ${accent} 22%, transparent)`
                            : undefined,
                        }}
                      />
                      <span className="min-w-0 text-xs font-semibold leading-snug">
                        {permissionLabel(perm)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {filteredCatalog.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          لا توجد صلاحيات مطابقة.
        </p>
      ) : null}
    </div>
  );
}
