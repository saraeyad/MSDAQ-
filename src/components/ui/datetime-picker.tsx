"use client";

import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** When false, only date is selected (yyyy-MM-dd). Default true. */
  includeTime?: boolean;
}

function parseDatetimeLocal(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = parse(
    value.length === 10 ? `${value}T00:00` : value,
    "yyyy-MM-dd'T'HH:mm",
    new Date(),
  );
  return isValid(date) ? date : undefined;
}

function toDatetimeLocal(date: Date, includeTime: boolean): string {
  return includeTime
    ? format(date, "yyyy-MM-dd'T'HH:mm")
    : format(date, "yyyy-MM-dd");
}

function formatDisplay(date: Date | undefined, includeTime: boolean): string {
  if (!date) return "";
  return includeTime
    ? format(date, "d MMMM yyyy · HH:mm", { locale: ar })
    : format(date, "d MMMM yyyy", { locale: ar });
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "اختر التاريخ والوقت",
  disabled = false,
  className,
  includeTime = true,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseDatetimeLocal(value), [value]);

  const timeValue = selected ? format(selected, "HH:mm") : "09:00";

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }

    const next = new Date(date);
    if (selected) {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else if (includeTime) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      next.setHours(hours || 9, minutes || 0, 0, 0);
    } else {
      next.setHours(0, 0, 0, 0);
    }

    onChange(toDatetimeLocal(next, includeTime));
    if (!includeTime) setOpen(false);
  };

  const handleTimeChange = (nextTime: string) => {
    const base = selected ?? new Date();
    const [hours, minutes] = nextTime.split(":").map(Number);
    const next = new Date(base);
    next.setHours(hours || 0, minutes || 0, 0, 0);
    onChange(toDatetimeLocal(next, true));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            "w-full justify-between font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selected
              ? formatDisplay(selected, includeTime)
              : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto overflow-hidden p-0"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelectDate}
          defaultMonth={selected}
          autoFocus
        />
        {includeTime ? (
          <div className="border-t border-border px-3 py-3">
            <Label className="mb-2 block text-xs text-muted-foreground">
              الوقت
            </Label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
              dir="ltr"
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
