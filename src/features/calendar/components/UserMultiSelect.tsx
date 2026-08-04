import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users_APIs } from "@/services/api/users";
import type { UserPickerItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface UserMultiSelectProps {
  label: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /** Pre-selected users shown before search (from edit forms). */
  seedUsers?: UserPickerItem[];
}

export function UserMultiSelect({
  label,
  selectedIds,
  onChange,
  seedUsers = [],
}: UserMultiSelectProps) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users-picker", search],
    queryFn: () => Users_APIs.search(search),
    staleTime: 30_000,
  });

  const options = useMemo(() => {
    const map = new Map<number, UserPickerItem>();
    for (const user of seedUsers) map.set(user.id, user);
    for (const user of data?.items ?? []) map.set(user.id, user);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [data?.items, seedUsers]);

  const optionIds = useMemo(() => options.map((user) => user.id), [options]);

  const allVisibleSelected =
    optionIds.length > 0 && optionIds.every((id) => selectedIds.includes(id));

  const someVisibleSelected =
    optionIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;

  useEffect(() => {
    if (search.length > 0) return;
    if (options.length === 0 && (data?.items?.length ?? 0) === 0 && !isLoading) {
      void Users_APIs.search("");
    }
  }, [data?.items?.length, isLoading, options.length, search.length]);

  const toggle = (userId: number, checked: boolean) => {
    onChange(
      checked
        ? [...new Set([...selectedIds, userId])]
        : selectedIds.filter((id) => id !== userId),
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      onChange([...new Set([...selectedIds, ...optionIds])]);
      return;
    }

    const visible = new Set(optionIds);
    onChange(selectedIds.filter((id) => !visible.has(id)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        {options.length > 0 ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={
                allVisibleSelected
                  ? true
                  : someVisibleSelected
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(checked) => toggleSelectAll(checked === true)}
            />
            تحديد الكل
          </label>
        ) : null}
      </div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث بالاسم..."
      />
      <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
        {isLoading && options.length === 0 ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          </div>
        ) : options.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا يوجد مستخدمون</p>
        ) : (
          options.map((user) => (
            <label
              key={user.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedIds.includes(user.id)}
                onCheckedChange={(checked) => toggle(user.id, checked === true)}
              />
              {user.name}
            </label>
          ))
        )}
      </div>
    </div>
  );
}
