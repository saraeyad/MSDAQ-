import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  applyDateToDatetimeLocal,
  applyTimeToDatetimeLocal,
  formatScheduleDate,
  formatScheduleTime,
  parseDatetimeLocal,
  SCHEDULE_TIME_SLOTS,
  snapTimeToQuarterHour,
  toDatetimeLocal,
} from "@/lib/calendar-datetime";
import { cn } from "@/lib/utils";

interface CalendarScheduleRowProps {
  value: string;
  onChange: (value: string) => void;
  endValue?: string;
  onEndChange?: (value: string) => void;
  showEndTime?: boolean;
  dateLocked?: boolean;
  disabled?: boolean;
  className?: string;
}

function TimeChipDropdown({
  value,
  onChange,
  disabled,
  placeholder = "اختر الوقت",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDatetimeLocal(value);
  const timeHHmm = selected
    ? snapTimeToQuarterHour(
        `${String(selected.getHours()).padStart(2, "0")}:${String(selected.getMinutes()).padStart(2, "0")}`,
      )
    : "";

  useEffect(() => {
    if (!open) return;
    document
      .querySelector("[data-schedule-time-selected='true']")
      ?.scrollIntoView({ block: "center" });
  }, [open, timeHHmm]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || !value}
          className={cn(
            "calendar-schedule-row__chip",
            open && "calendar-schedule-row__chip--active",
          )}
        >
          {selected ? formatScheduleTime(selected) : placeholder}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="calendar-schedule-row__time-menu max-h-56 w-36 p-1"
      >
        {SCHEDULE_TIME_SLOTS.map((slot) => {
          const labelDate = selected ?? new Date();
          const [hours, minutes] = slot.split(":").map(Number);
          const preview = new Date(labelDate);
          preview.setHours(hours, minutes, 0, 0);
          const isSelected = slot === timeHHmm;

          return (
            <DropdownMenuItem
              key={slot}
              data-schedule-time-selected={isSelected ? "true" : undefined}
              className={cn(
                "calendar-schedule-row__time-item justify-center font-normal",
                isSelected && "bg-accent text-accent-foreground",
              )}
              onSelect={() => {
                onChange(applyTimeToDatetimeLocal(value, slot));
              }}
            >
              {formatScheduleTime(preview)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CalendarScheduleRow({
  value,
  onChange,
  endValue = "",
  onEndChange,
  showEndTime = false,
  dateLocked = false,
  disabled = false,
  className,
}: CalendarScheduleRowProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const selected = useMemo(() => parseDatetimeLocal(value), [value]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    onChange(applyDateToDatetimeLocal(value, date));
    setDateOpen(false);
  };

  const dateChip = selected ? (
    formatScheduleDate(selected)
  ) : (
    "اختر التاريخ"
  );

  return (
    <div className={cn("calendar-schedule-row", className)}>
      <Clock
        className="calendar-schedule-row__icon size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />

      {dateLocked ? (
        <span className="calendar-schedule-row__chip calendar-schedule-row__chip--locked">
          {dateChip}
        </span>
      ) : (
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "calendar-schedule-row__chip",
                dateOpen && "calendar-schedule-row__chip--active",
              )}
            >
              {dateChip}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelectDate}
              defaultMonth={selected}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      )}

      <TimeChipDropdown
        value={value}
        onChange={onChange}
        disabled={disabled}
      />

      {showEndTime && onEndChange ? (
        <>
          <span className="calendar-schedule-row__dash" aria-hidden>
            —
          </span>
          <TimeChipDropdown
            value={endValue || value}
            onChange={onEndChange}
            disabled={disabled || !value}
            placeholder="النهاية"
          />
        </>
      ) : null}
    </div>
  );
}

/** Ensure a datetime-local string uses a quarter-hour time slot. */
export function normalizeScheduleDatetime(value: string): string {
  const parsed = parseDatetimeLocal(value);
  if (!parsed) return value;
  const time = snapTimeToQuarterHour(
    `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`,
  );
  return applyTimeToDatetimeLocal(toDatetimeLocal(parsed), time);
}
