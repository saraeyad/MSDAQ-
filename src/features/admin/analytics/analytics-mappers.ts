import type {
  AdminAnalyticsCountry,
  AdminAnalyticsDevice,
  AdminAnalyticsReferrer,
  AdminAnalyticsTopPage,
} from "@/types";
import type { DonutChartItem } from "@/features/admin/dashboard/components/DonutChartCard";
import type { HorizontalBarChartItem } from "@/features/admin/dashboard/components/HorizontalBarChartCard";
import { donutColor } from "@/features/admin/dashboard/components/chart-colors";

function pickNumber(
  row: Record<string, unknown>,
  keys: string[],
): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return 0;
}

function pickString(
  row: Record<string, unknown>,
  keys: string[],
  fallback: string,
): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

export function formatSessionDuration(secs: number): string {
  if (!Number.isFinite(secs) || secs <= 0) return "0:00";
  const total = Math.round(secs);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("ar").format(value);
}

export interface AnalyticsPageRow {
  label: string;
  path: string;
  views: number;
}

export function mapTopPages(
  rows: AdminAnalyticsTopPage[],
): AnalyticsPageRow[] {
  return rows
    .map((row) => {
      const record = row as Record<string, unknown>;
      const path = pickString(record, ["path", "page_path"], "/");
      const title = pickString(record, ["page_title", "title"], "");
      const views = pickNumber(record, ["views", "pageviews", "count"]);
      return {
        path,
        label: title || path,
        views,
      };
    })
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

export function mapReferrers(
  rows: AdminAnalyticsReferrer[],
): HorizontalBarChartItem[] {
  return rows
    .map((row) => {
      const record = row as Record<string, unknown>;
      return {
        name: pickString(record, ["source", "referrer", "name"], "مباشر"),
        value: pickNumber(record, ["sessions", "visitors", "users", "count"]),
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function mapDevices(rows: AdminAnalyticsDevice[]): DonutChartItem[] {
  return rows
    .map((row, index) => {
      const record = row as Record<string, unknown>;
      return {
        name: pickString(record, ["device", "name"], "غير معروف"),
        value: pickNumber(record, ["sessions", "visitors", "users", "count"]),
        color: donutColor(index),
      };
    })
    .filter((item) => item.value > 0);
}

export function mapCountries(
  rows: AdminAnalyticsCountry[],
): HorizontalBarChartItem[] {
  return rows
    .map((row) => {
      const record = row as Record<string, unknown>;
      return {
        name: pickString(record, ["country", "name"], "غير معروف"),
        value: pickNumber(record, ["sessions", "visitors", "users", "count"]),
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}
