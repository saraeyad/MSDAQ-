import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

interface DataTableStringFilterProps<TData> {
  column?: Column<TData, unknown>;
  placeholder?: string;
  className?: string;
  type?: "text" | "number";
  floatingLabel?: boolean;
}

export function DataTableStringFilter<TData>({
  column,
  placeholder,
  className,
  type = "text",
  floatingLabel = false,
}: DataTableStringFilterProps<TData>) {
  const value = column?.getFilterValue() as string;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    column?.setFilterValue(newValue || undefined);
  };

  const handleClear = () => {
    column?.setFilterValue(undefined);
  };

  return (
    <div className={cn("relative", className)}>
      {floatingLabel && (
        <label
          className={cn(
            "pointer-events-none absolute origin-[0] -translate-y-1/2 transform text-sm text-muted-foreground transition-all duration-200 ease-in-out select-none",
            {
              "top-0 scale-75 start-0 bg-white px-1 translate-x-3 -translate-y-[10px]":
                value,
              "top-1/2 scale-100 start-3": !value,
            }
          )}
        >
          {placeholder}
        </label>
      )}

      <Input
        type={type}
        value={value || ""}
        onChange={handleChange}
        placeholder={floatingLabel ? " " : placeholder}
        className={cn("peer")}
      />

      {value && (
        <button
          className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
          onClick={handleClear}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
