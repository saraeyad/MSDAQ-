"use client";

import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRangeFilterValue } from "@/components/ui/date-range-filter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TrustIndexDateFilterProps {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
  onApply: () => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
  disabled?: boolean;
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

function formatDisplayDate(date: Date | undefined): string {
  if (!date) return "";
  return format(date, "d MMM yyyy", { locale: ar });
}

interface CompactDateFieldProps {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function CompactDateField({
  label,
  value,
  placeholder,
  disabled = false,
  onChange,
}: CompactDateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseDate(value), [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? toDateString(date) : "");
    setOpen(false);
  };

  return (
    <div className="trust-date-filter__field">
      <span className="trust-date-filter__label">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            data-empty={!selected}
            className="trust-date-filter__trigger"
            aria-label={`${label}: ${selected ? formatDisplayDate(selected) : placeholder}`}
          >
            <CalendarIcon className="trust-date-filter__icon" aria-hidden />
            <span className="trust-date-filter__value">
              {selected ? formatDisplayDate(selected) : placeholder}
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
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TrustIndexDateFilter({
  value,
  onChange,
  onApply,
  onClearAll,
  showClearAll = false,
  disabled = false,
  className,
}: TrustIndexDateFilterProps) {
  const handleShowAll = () => {
    onChange({ start: "", end: "" });
    onClearAll?.();
  };

  return (
    <div className={cn("trust-date-filter trust-date-filter--compact", className)}>
      <CompactDateField
        label="من"
        value={value.start}
        placeholder="اختر تاريخاً"
        disabled={disabled}
        onChange={(start) => onChange({ ...value, start })}
      />
      <CompactDateField
        label="إلى"
        value={value.end}
        placeholder="اختر تاريخاً"
        disabled={disabled}
        onChange={(end) => onChange({ ...value, end })}
      />
      <Button
        type="button"
        size="sm"
        variant="default"
        className="trust-date-filter__apply"
        disabled={disabled}
        onClick={onApply}
      >
        تطبيق
      </Button>
      {showClearAll ? (
        <button
          type="button"
          className="trust-date-filter__reset"
          disabled={disabled}
          aria-label="عرض كل الاستجابات بدون فلتر تاريخ"
          onClick={handleShowAll}
        >
          <span className="trust-date-filter__reset-icon" aria-hidden>
            <LayoutGrid />
          </span>
          <span>الكل</span>
        </button>
      ) : null}
    </div>
  );
}
