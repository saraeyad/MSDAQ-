import { format, isValid } from "date-fns";

export function formatDateParam(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
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
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}

export function initialMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: formatDateParam(start), end: formatDateParam(end) };
}
