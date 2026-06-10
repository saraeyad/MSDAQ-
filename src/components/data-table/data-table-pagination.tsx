import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8",
        className
      )}
      {...props}
    >
      <div className="flex-1 whitespace-nowrap text-muted-foreground text-sm">
        {table.getFilteredRowModel().rows.length > 0 ? (
          <>
            {t("GENERAL.PAGINATION_TEXT", {
              length:
                table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1,
              to: Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              ),
              total: (table.getState().pagination as any).totalResults,
            })}
          </>
        ) : (
          "No results"
        )}
      </div>
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap font-medium text-sm xl:block hidden">
            {t("GENERAL.ROWS_PER_PAGE")}
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[4.5rem] [&[data-size]]:h-8">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="border-border bg-card">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="xl:flex items-center justify-center font-medium text-sm hidden">
          {t("GENERAL.PAGE_OF", {
            page: table.getState().pagination.pageIndex + 1,
            totalPages: table.getPageCount(),
          })}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            className="hidden size-8 xl:flex"
            disabled={!table.getCanPreviousPage()}
            size="icon"
            variant="outline"
            onClick={() => table.setPageIndex(0)}
          >
            <ChevronsLeft className="rtl:rotate-180" />
          </Button>
          <Button
            aria-label="Go to previous page"
            className="size-8"
            disabled={!table.getCanPreviousPage()}
            size="icon"
            variant="outline"
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="rtl:rotate-180" />
          </Button>
          <div className="block xl:hidden">
            {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
          </div>
          <Button
            aria-label="Go to next page"
            className="size-8"
            disabled={!table.getCanNextPage()}
            size="icon"
            variant="outline"
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="rtl:rotate-180" />
          </Button>
          <Button
            aria-label="Go to last page"
            className="hidden size-8 xl:flex"
            disabled={!table.getCanNextPage()}
            size="icon"
            variant="outline"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          >
            <ChevronsRight className="rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
