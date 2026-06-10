import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle, XCircle } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: any[];
  multiple?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  labelField?: string;
  valueField?: string;
  checkOption?: boolean;
  customEmptyMessage?: string;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  multiple,
  triggerClassName,
  contentClassName,
  labelField = "label",
  valueField = "value",
  customEmptyMessage,
  checkOption,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const columnFilterValue = column?.getFilterValue();
  const selectedValues = React.useMemo(
    () => new Set(Array.isArray(columnFilterValue) ? columnFilterValue : []),
    [columnFilterValue]
  );

  const onItemSelect = React.useCallback(
    (option: any, isSelected: boolean) => {
      if (!column) {
        return;
      }

      if (multiple) {
        const newSelectedValues = new Set(selectedValues);

        if (isSelected) {
          newSelectedValues.delete(option[valueField]);
        } else {
          newSelectedValues.add(option[valueField]);
        }
        const filterValues = Array.from(newSelectedValues);

        column.setFilterValue(filterValues.length ? filterValues : undefined);
      } else {
        column.setFilterValue(isSelected ? undefined : [option]);
        setOpen(false);
      }
    },
    [column, multiple, selectedValues, setOpen, valueField]
  );

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      column?.setFilterValue(undefined);
    },
    [column]
  );

  const setHasOption = (set: any, option: any) => {
    return [...set].some(
      (item) =>
        item[valueField] === option[valueField] &&
        item[labelField] === option[labelField]
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn("border-dashed", triggerClassName)}
          size="sm"
          variant="outline"
        >
          {selectedValues?.size > 0 ? (
            <div
              aria-label={`Clear ${title} filter`}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              role="button"
              tabIndex={0}
              onClick={onReset}
            >
              <XCircle />
            </div>
          ) : (
            <PlusCircle />
          )}

          {title}

          {selectedValues?.size > 0 && (
            <>
              <Separator
                className="mx-0.5 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />
              <Badge
                className="rounded-sm px-1 font-normal lg:hidden"
                variant="secondary"
              >
                {selectedValues.size}
              </Badge>

              <div className="hidden items-center gap-1 lg:flex">
                {multiple && selectedValues.size > 0 ? (
                  <Badge
                    className="rounded-sm px-1 font-normal"
                    variant="secondary"
                  >
                    {selectedValues.size}
                  </Badge>
                ) : (
                  options
                    .filter((option) => {
                      return checkOption
                        ? setHasOption(selectedValues, option)
                        : selectedValues.has(option || option[valueField]);
                    })
                    .map((option, index) => {
                      return (
                        <Badge
                          key={index}
                          className="rounded-sm px-1 font-normal"
                          variant="secondary"
                        >
                          {option[labelField]}
                        </Badge>
                      );
                    })
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-[12.5rem] p-0 bg-white", contentClassName)}
      >
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty>
              {customEmptyMessage || t("GENERAL.NO_OPTIONS")}
            </CommandEmpty>
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
              {options.map((option, index) => {
                const isSelected = selectedValues.has(option[valueField]);

                return (
                  <CommandItem
                    key={index}
                    onSelect={() => onItemSelect(option, isSelected)}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    {option.icon && <option.icon />}
                    <span className="truncate">{option[labelField]}</span>
                    {option.count && (
                      <span className="ml-auto font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    className="justify-center text-center"
                    onSelect={() => onReset()}
                  >
                    {t("BTN.CLEAR")}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
