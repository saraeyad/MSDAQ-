import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  format,
  isValid,
  parse,
} from "date-fns";
import { ar } from "date-fns/locale";

/** 15-minute slots from 00:00 through 23:45. */
export const SCHEDULE_TIME_SLOTS: string[] = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

export function isFutureDatetimeLocal(value: string): boolean {
  const parsed = parseDatetimeLocal(value);
  return Boolean(parsed && parsed.getTime() > Date.now());
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Local calendar day at midnight, ignoring any UTC/all-day offset on the source Date. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameLocalDay(left: Date, right: Date): boolean {
  return startOfLocalDay(left).getTime() === startOfLocalDay(right).getTime();
}

/** First quarter-hour slot at least 15 minutes from now, so it stays valid while the form is open. */
export function nextFutureSlot(): Date {
  const next = addMinutes(new Date(), 15);
  next.setSeconds(0, 0);
  next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15);
  return next;
}

export function parseDatetimeLocal(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = parse(
    value.length === 10 ? `${value}T00:00` : value,
    "yyyy-MM-dd'T'HH:mm",
    new Date(),
  );
  return isValid(date) ? date : undefined;
}

export function toDatetimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

/** e.g. الجمعة، 14 أغسطس — includes year when not the current year */
export function formatScheduleDate(date: Date): string {
  const pattern =
    date.getFullYear() === new Date().getFullYear()
      ? "EEEE، d MMMM"
      : "EEEE، d MMMM yyyy";
  return format(date, pattern, { locale: ar });
}

export type RecurrenceKind = "daily" | "weekly" | "monthly";

/** Default recurrence_end_at after the anchor, preserving clock time. */
export function defaultRecurrenceEndAt(
  anchorValue: string,
  recurrence: RecurrenceKind,
): string {
  const anchor = parseDatetimeLocal(anchorValue);
  if (!anchor) return "";

  let end: Date;
  switch (recurrence) {
    case "daily":
      end = addDays(anchor, 7);
      break;
    case "weekly":
      end = addWeeks(anchor, 4);
      break;
    case "monthly":
      end = addMonths(anchor, 1);
      break;
  }
  return toDatetimeLocal(end);
}

export function isRecurrenceEndAfterAnchor(
  anchorValue: string,
  endValue: string,
): boolean {
  const anchor = parseDatetimeLocal(anchorValue);
  const end = parseDatetimeLocal(endValue);
  if (!anchor || !end) return false;
  return end.getTime() > anchor.getTime();
}

export type SchedulePeriod = "ص" | "م";

/** 12-hour clock slots: 12:00 … 11:45 */
export const SCHEDULE_CLOCK_SLOTS: string[] = Array.from(
  { length: 48 },
  (_, index) => {
    const totalMinutes = index * 15;
    const hour12 = Math.floor(totalMinutes / 60) || 12;
    const minutes = totalMinutes % 60;
    return `${hour12}:${String(minutes).padStart(2, "0")}`;
  },
);

/** e.g. 9:00 — no AM/PM */
export function formatScheduleClock(date: Date): string {
  const hour12 = date.getHours() % 12 || 12;
  return `${hour12}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatSchedulePeriod(date: Date): SchedulePeriod {
  return date.getHours() < 12 ? "ص" : "م";
}

/** e.g. 9:00 ص or 1:30 م */
export function formatScheduleTime(date: Date): string {
  return `${formatScheduleClock(date)} ${formatSchedulePeriod(date)}`;
}

export function clockAndPeriodToHHmm(
  clock: string,
  period: SchedulePeriod,
): string {
  const [rawHour, rawMinutes] = clock.split(":").map(Number);
  const hour12 = rawHour || 12;
  let hours = hour12 % 12;
  if (period === "م") hours += 12;
  return `${String(hours).padStart(2, "0")}:${String(rawMinutes || 0).padStart(2, "0")}`;
}

export function applyPeriodToDatetimeLocal(
  dateValue: string,
  period: SchedulePeriod,
): string {
  const current = parseDatetimeLocal(dateValue);
  if (!current) return dateValue;
  const clock = formatScheduleClock(current);
  return applyTimeToDatetimeLocal(
    dateValue,
    clockAndPeriodToHHmm(clock, period),
  );
}

export function applyTimeToDatetimeLocal(
  dateValue: string,
  timeHHmm: string,
): string {
  const base = parseDatetimeLocal(dateValue) ?? new Date();
  const [hours, minutes] = timeHHmm.split(":").map(Number);
  const next = new Date(base);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return toDatetimeLocal(next);
}

export function applyDateToDatetimeLocal(
  dateValue: string,
  pickedDate: Date,
): string {
  const current = parseDatetimeLocal(dateValue);
  const next = new Date(pickedDate);
  if (current) {
    next.setHours(current.getHours(), current.getMinutes(), 0, 0);
  } else {
    next.setHours(9, 0, 0, 0);
  }
  return toDatetimeLocal(next);
}

export function defaultEndDatetimeLocal(
  startValue: string,
  durationMinutes = 60,
): string {
  const start = parseDatetimeLocal(startValue);
  if (!start) return "";
  return toDatetimeLocal(addMinutes(start, durationMinutes));
}

export function snapTimeToQuarterHour(timeHHmm: string): string {
  const [hours, minutes] = timeHHmm.split(":").map(Number);
  let total = (hours || 0) * 60 + (minutes || 0);
  total = Math.round(total / 15) * 15;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHours = Math.floor(total / 60);
  const nextMinutes = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

export function formatDateParam(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function timezoneOffset(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

/** Format a local Date as ISO 8601 while retaining its explicit local offset. */
export function dateToOffsetIso(date: Date): string {
  return `${format(date, "yyyy-MM-dd'T'HH:mm:ss")}${timezoneOffset(date)}`;
}

export function datetimeLocalToIso(value: string): string {
  const parsed = parseDatetimeLocal(value);
  if (!parsed) return "";
  return dateToOffsetIso(parsed);
}

export function isoToDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  if (!isValid(date)) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function openCreateDatetime(date: Date): string {
  const day = startOfLocalDay(date);
  day.setHours(9, 0, 0, 0);

  // Keep the clicked calendar day. Only bump the clock when that day is today
  // and 09:00 has already passed.
  if (isSameLocalDay(day, new Date()) && day.getTime() <= Date.now()) {
    return toDatetimeLocal(nextFutureSlot());
  }

  return toDatetimeLocal(day);
}

export function initialMonthRange(): { start: string; end: string } {
  const now = new Date();
  return calendarRangeToOffsetIso(
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 1),
  );
}

export function calendarRangeToOffsetIso(
  start: Date,
  exclusiveEnd: Date,
): { start: string; end: string } {
  const rangeStart = new Date(start);
  rangeStart.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(exclusiveEnd);
  rangeEnd.setHours(0, 0, 0, 0);

  return {
    start: dateToOffsetIso(rangeStart),
    end: dateToOffsetIso(rangeEnd),
  };
}

/** Keep the original clock time while using the calendar day selected by a drop. */
export function moveToOffsetIso(original: string, droppedOn: Date): string {
  const originalDate = new Date(original);
  const moved = new Date(droppedOn);
  moved.setHours(
    originalDate.getHours(),
    originalDate.getMinutes(),
    originalDate.getSeconds(),
    0,
  );
  return dateToOffsetIso(moved);
}
