import type {
  AdminAnalyticsCountry,
  AdminAnalyticsDevice,
  AdminAnalyticsReferrer,
} from "@/types";
import type { HorizontalBarChartItem } from "@/features/admin/dashboard/components/HorizontalBarChartCard";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickNumber(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function pickString(
  row: Record<string, unknown>,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

const METRIC_KEYS = [
  "views",
  "pageviews",
  "sessions",
  "visitors",
  "users",
  "count",
  "value",
];

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

function humanizeSource(raw: string): string {
  const key = raw.toLowerCase();
  if (!raw || key === "(direct)" || key === "direct") return "مباشر";
  if (key.includes("facebook") || key.includes("fbclid")) return "فيسبوك";
  if (key.includes("instagram")) return "إنستغرام";
  if (key.includes("google")) return "جوجل";
  if (key.includes("t.me") || key.includes("telegram")) return "تيليجرام";
  if (key.includes("localhost")) return "محلي";
  if (key.includes("sabbarapost.org")) return "الموقع";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, "") || raw;
  } catch {
    return raw;
  }
}

function humanizeDevice(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (key === "mobile" || key === "phone") return "جوال";
  if (key === "desktop") return "حاسوب";
  if (key === "tablet") return "لوحي";
  return raw;
}

function humanizeCountry(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (key === "palestine") return "فلسطين";
  if (key === "jordan") return "الأردن";
  if (key === "egypt") return "مصر";
  if (key === "lebanon") return "لبنان";
  if (key === "germany") return "ألمانيا";
  if (key === "israel") return "فلسطين المحتلة";
  return raw;
}

function mergeNamedValues(
  items: HorizontalBarChartItem[],
): HorizontalBarChartItem[] {
  const byName = new Map<string, number>();
  for (const item of items) {
    byName.set(item.name, (byName.get(item.name) ?? 0) + item.value);
  }
  return [...byName.entries()].map(([name, value]) => ({ name, value }));
}

function toNamedValue(
  row: unknown,
  nameKeys: string[],
  metricKeys: string[],
): HorizontalBarChartItem {
  const record = asRecord(row) ?? {};
  return {
    name: pickString(record, nameKeys),
    value: pickNumber(record, metricKeys),
  };
}

export function mapReferrers(
  rows: AdminAnalyticsReferrer[],
): HorizontalBarChartItem[] {
  return mergeNamedValues(
    rows.map((row) =>
      toNamedValue(
        row,
        ["source", "sessionSource", "referrer", "name"],
        ["views", ...METRIC_KEYS],
      ),
    ).map((item) => ({ ...item, name: humanizeSource(item.name) })),
  )
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function mapDevices(
  rows: AdminAnalyticsDevice[],
): HorizontalBarChartItem[] {
  return rows
    .map((row) => {
      const item = toNamedValue(
        row,
        ["device", "deviceCategory", "name"],
        ["users", ...METRIC_KEYS],
      );
      return {
        name: humanizeDevice(item.name || "غير معروف"),
        value: item.value,
      };
    })
    .filter((item) => item.value > 0);
}

export function mapCountries(
  rows: AdminAnalyticsCountry[],
): HorizontalBarChartItem[] {
  return mergeNamedValues(
    rows.map((row) => {
      const item = toNamedValue(
        row,
        ["country", "name"],
        ["views", ...METRIC_KEYS],
      );
      return { ...item, name: humanizeCountry(item.name) };
    }),
  )
    .filter((item) => item.name && item.name !== "غير معروف")
    .sort((a, b) => b.value - a.value);
}
