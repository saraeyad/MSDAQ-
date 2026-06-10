import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { cn } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import type * as React from "react";

interface DataTableAdvancedToolbarProps<TData>
  extends React.ComponentProps<"div"> {
  table: Table<TData>;
  viewOptions?: boolean;
}

export function DataTableAdvancedToolbar<TData>({
  table,
  children,
  className,
  viewOptions,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className
      )}
      role="toolbar"
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {viewOptions && (
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
        </div>
      )}
    </div>
  );
}
