import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";
import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import type * as React from "react";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<TData>({
  table,
  actionBar,
  children,
  className,
  isLoading = false,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div className="content-card overflow-hidden rounded">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-100 px-4 py-3 text-foreground border-none hover:bg-gray-100"
              >
                <TableHead
                  colSpan={1}
                  className="w-12 text-center text-sm font-medium"
                >
                  #
                </TableHead>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="text-sm whitespace-nowrap font-medium"
                    style={{
                      textAlign:
                        (header.column.columnDef as any)?.align || "start",
                      ...getCommonPinningStyles({
                        column: header.column,
                        isHeader: true,
                      }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow
                  key={`loading-${i}`}
                  className="animate-pulse border-0"
                >
                  <TableCell className="px-4 py-3 border-0">
                    <div className="h-4 w-6 bg-muted rounded border-0" />
                  </TableCell>
                  {table.getAllLeafColumns().map((column, j) => (
                    <TableCell key={j} className="px-3 py-2 border-0">
                      <div className="h-4 w-full bg-muted rounded border-0" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-muted/100 last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {(() => {
                      const pageSize = table.getState().pagination.pageSize;
                      const pageIndex = table.getState().pagination.pageIndex;
                      return pageIndex * pageSize + row.index + 1;
                    })()}
                  </TableCell>

                  {row.getVisibleCells().map((cell) => {
                    const value = cell.getValue();
                    const accessorKey = (cell.column.columnDef as any)
                      ?.accessorKey;

                    return (
                      <TableCell
                        key={cell.id}
                        className="text-sm px-3 py-2 text-foreground"
                        style={{
                          textAlign:
                            (cell.column.columnDef as any)?.align || "start",
                          ...getCommonPinningStyles({
                            column: cell.column,
                            isCell: true,
                          }),
                        }}
                      >
                        {cell.column.id === "actions" ||
                        accessorKey === "actions" ? (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        ) : value === null ||
                          value === undefined ||
                          value === "" ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length + 1}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-4 py-6">
                    <p className="text-muted-foreground text-sm">
                      لا توجد بيانات لعرضها حالياً
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2.5">
        {(table.getState().pagination as any).totalResults > 5 && (
          <DataTablePagination table={table} />
        )}
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
