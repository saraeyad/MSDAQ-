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
  applyPeriodToDatetimeLocal,
  applyTimeToDatetimeLocal,
  clockAndPeriodToHHmm,
  formatScheduleClock,
  formatScheduleDate,
  formatSchedulePeriod,
  isFutureDatetimeLocal,
  nextFutureSlot,
  parseDatetimeLocal,
  SCHEDULE_CLOCK_SLOTS,
  snapTimeToQuarterHour,
  startOfLocalDay,
  startOfToday,
  toDatetimeLocal,
  type SchedulePeriod,
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
  /** Block dates/times that are not after now. */
  requireFuture?: boolean;
  className?: string;
}

function TimeChipDropdown({
  value,
  onChange,
  disabled,
  requireFuture,
  placeholder = "الوقت",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  requireFuture?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDatetimeLocal(value);
  const period: SchedulePeriod = selected
    ? formatSchedulePeriod(selected)
    : "ص";
  const clock = selected ? formatScheduleClock(selected) : "";

  useEffect(() => {
    if (!open) return;
    document
      .querySelector("[data-schedule-time-selected='true']")
      ?.scrollIntoView({ block: "center" });
  }, [open, clock]);

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
          {clock || placeholder}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="calendar-schedule-row__time-menu max-h-56 w-24 p-1"
      >
        {SCHEDULE_CLOCK_SLOTS.map((slot) => {
          const isSelected = slot === clock;
          const nextValue = applyTimeToDatetimeLocal(
            value,
            clockAndPeriodToHHmm(slot, period),
          );
          const isPast = requireFuture && !isFutureDatetimeLocal(nextValue);

          return (
            <DropdownMenuItem
              key={slot}
              disabled={isPast}
              data-schedule-time-selected={isSelected ? "true" : undefined}
              className={cn(
                "calendar-schedule-row__time-item justify-center font-normal",
                isSelected && "bg-accent text-accent-foreground",
              )}
              onSelect={() => {
                if (isPast) return;
                onChange(nextValue);
              }}
            >
              {slot}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PeriodChip({
  value,
  onChange,
  disabled,
  requireFuture,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  requireFuture?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDatetimeLocal(value);
  const period: SchedulePeriod = selected
    ? formatSchedulePeriod(selected)
    : "ص";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || !value}
          className={cn(
            "calendar-schedule-row__chip calendar-schedule-row__chip--period",
            open && "calendar-schedule-row__chip--active",
          )}
          aria-label={period === "ص" ? "صباحاً" : "مساءً"}
        >
          {period}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-20 p-1">
        {(["ص", "م"] as const).map((option) => {
          const nextValue = applyPeriodToDatetimeLocal(value, option);
          const isPast = requireFuture && !isFutureDatetimeLocal(nextValue);
          return (
            <DropdownMenuItem
              key={option}
              disabled={isPast}
              className={cn(
                "justify-center font-normal",
                option === period && "bg-accent text-accent-foreground",
              )}
              onSelect={() => {
                if (isPast) return;
                onChange(nextValue);
              }}
            >
              {option}
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
  requireFuture = false,
  className,
}: CalendarScheduleRowProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const selected = useMemo(() => parseDatetimeLocal(value), [value]);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    let next = applyDateToDatetimeLocal(value, date);
    if (requireFuture && !isFutureDatetimeLocal(next)) {
      const pickedDay = startOfLocalDay(date);
      if (pickedDay.getTime() > startOfToday().getTime()) {
        next = applyTimeToDatetimeLocal(next, "09:00");
      } else {
        next = toDatetimeLocal(nextFutureSlot());
      }
    }
    onChange(next);
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
              disabled={requireFuture ? { before: startOfToday() } : undefined}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      )}

      <TimeChipDropdown
        value={value}
        onChange={onChange}
        disabled={disabled}
        requireFuture={requireFuture}
      />
      <PeriodChip
        value={value}
        onChange={onChange}
        disabled={disabled}
        requireFuture={requireFuture}
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
            requireFuture={requireFuture}
            placeholder="النهاية"
          />
          <PeriodChip
            value={endValue || value}
            onChange={onEndChange}
            disabled={disabled || !value}
            requireFuture={requireFuture}
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
