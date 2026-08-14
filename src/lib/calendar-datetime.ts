import { addMinutes, format, isValid, parse } from "date-fns";
import { ar } from "date-fns/locale";

/** 15-minute slots from 00:00 through 23:45. */
export const SCHEDULE_TIME_SLOTS: string[] = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

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

/** e.g. الجمعة، 14 أغسطس */
export function formatScheduleDate(date: Date): string {
  return format(date, "EEEE، d MMMM", { locale: ar });
}

/** e.g. 9:00 ص or 1:30 م */
export function formatScheduleTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hour12 = hours % 12 || 12;
  const period = hours < 12 ? "ص" : "م";
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
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
  const local = new Date(date);
  local.setHours(9, 0, 0, 0);
  return format(local, "yyyy-MM-dd'T'HH:mm");
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
