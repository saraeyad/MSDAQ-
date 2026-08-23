"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { format, isValid, parse, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, LayoutGrid } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangeFilterValue {
  start: string;
  end: string;
}

interface DateRangeFilterProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

function parseDate(value: string): Date | undefined {
  if (!value.trim()) return undefined;
  const date = parse(value, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : undefined;
}

function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function formatCompactDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: ar });
}

function toDateRange(value: DateRangeFilterValue): DateRange | undefined {
  const from = parseDate(value.start);
  const to = parseDate(value.end);
  if (!from) return undefined;
  return { from, to: to ?? from };
}

function formatRangeLabel(value: DateRangeFilterValue, placeholder: string): string {
  const start = parseDate(value.start);
  const end = parseDate(value.end);

  if (start && end) {
    return `${formatCompactDate(start)} — ${formatCompactDate(end)}`;
  }

  return placeholder;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Default window: today and the previous 16 days (17 days inclusive). */
export function getDefaultDateRange(daysBack = 16): DateRangeFilterValue {
  const end = startOfToday();
  const start = subDays(end, daysBack);
  return {
    start: toDateString(start),
    end: toDateString(end),
  };
}

export function isAllDatesRange(value: DateRangeFilterValue): boolean {
  return !value.start && !value.end;
}

export function DateRangeFilter({
  value,
  onChange,
  disabled = false,
  placeholder = "اختر نطاق التاريخ",
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>();

  const appliedRange = useMemo(() => toDateRange(value), [value]);
  const hasAppliedValue = Boolean(value.start && value.end);
  const canApply = Boolean(draftRange?.from && draftRange?.to);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraftRange(appliedRange);
    }
  };

  const handleApply = () => {
    if (!draftRange?.from || !draftRange?.to) return;

    onChange({
      start: toDateString(draftRange.from),
      end: toDateString(draftRange.to),
    });
    setOpen(false);
  };

  const handleClearDraft = () => {
    setDraftRange(undefined);
  };

  const handleToday = () => {
    const today = startOfToday();
    setDraftRange({ from: today, to: today });
  };

  const handleShowAll = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange({ start: "", end: "" });
    setDraftRange(undefined);
    setOpen(false);
  };

  return (
    <div className={cn("date-range-filter", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            data-empty={!hasAppliedValue}
            className="date-range-filter__trigger"
            aria-label={hasAppliedValue ? "تعديل نطاق التاريخ" : placeholder}
          >
            <CalendarIcon className="date-range-filter__icon" aria-hidden />
            <span className="date-range-filter__label">
              {formatRangeLabel(value, placeholder)}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={6}
          collisionPadding={12}
          className="date-range-filter__popover w-auto p-0"
        >
          <Calendar
            mode="range"
            selected={draftRange}
            onSelect={setDraftRange}
            defaultMonth={draftRange?.from ?? appliedRange?.from}
            numberOfMonths={1}
            autoFocus
          />
          <div className="date-range-filter__footer">
            <Button
              type="button"
              size="sm"
              variant="default"
              className="date-range-filter__footer-btn"
              disabled={disabled}
              onClick={handleToday}
            >
              اليوم
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="date-range-filter__footer-btn"
              disabled={disabled}
              onClick={handleClearDraft}
            >
              مسح
            </Button>
            <Button
              type="button"
              size="sm"
              variant="default"
              className="date-range-filter__footer-btn"
              disabled={disabled || !canApply}
              onClick={handleApply}
            >
              تطبيق
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasAppliedValue ? (
        <button
          type="button"
          className="date-range-filter__reset"
          disabled={disabled}
          aria-label="عرض كل الملاحظات بدون فلتر تاريخ"
          onClick={handleShowAll}
        >
          <span className="date-range-filter__reset-icon" aria-hidden>
            <LayoutGrid />
          </span>
          <span>الكل</span>
        </button>
      ) : null}
    </div>
  );
}
