import type {
  AdminAnalyticsCountry,
  AdminAnalyticsDevice,
  AdminAnalyticsReferrer,
} from "@/types";
import type { DonutChartItem } from "@/features/admin/dashboard/components/DonutChartCard";
import type { HorizontalBarChartItem } from "@/features/admin/dashboard/components/HorizontalBarChartCard";
import { donutColor } from "@/features/admin/dashboard/components/chart-colors";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickNumber(
  row: Record<string, unknown>,
  keys: string[],
): number {
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

const METRIC_KEYS = [
  "views",
  "pageviews",
  "pageViews",
  "screenPageViews",
  "screen_page_views",
  "sessions",
  "visitors",
  "users",
  "count",
  "value",
];

const ARTICLE_PATH = /^\/articles\/[^/]+$/;

const KNOWN_PAGE_LABELS: Record<string, string> = {
  "/": "الرئيسية",
  "/articles": "المقالات",
  "/about": "عن المنصة",
  "/partners": "الشركاء",
  "/who-we-are": "تعرف علينا",
  "/contact": "تواصل معنا",
  "/site-policy": "سياسة الموقع",
  "/terms": "الشروط",
  "/tools-overview": "الأدوات",
  "/ruya": "رؤيا",
  "/publications": "إصدارات ودراسات",
  "/publications/reports": "تقارير",
  "/publications/books": "كتب",
  "/data-info": "معلومات وبيانات",
};

export function isArticleAnalyticsPath(path: string): boolean {
  return ARTICLE_PATH.test(path);
}

function looksLikeHost(hostname: string): boolean {
  return hostname === "localhost" || hostname.includes(".");
}

function pathnameFromLocation(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (!looksLikeHost(url.hostname)) return null;
    return url.pathname || "/";
  } catch {
    return null;
  }
}

function normalizePath(raw: string): string {
  const value = raw.trim();
  if (!value || value === "(not set)" || value === "(other)") return "/";
  const fromHost = pathnameFromLocation(value);
  if (fromHost) return fromHost;
  const path = value.split(/[?#]/)[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function humanizePath(path: string): string {
  const clean = path.replace(/\/+$/, "") || "/";
  if (KNOWN_PAGE_LABELS[clean]) return KNOWN_PAGE_LABELS[clean];
  if (KNOWN_PAGE_LABELS[path]) return KNOWN_PAGE_LABELS[path];
  if (clean.startsWith("/categories/")) {
    const slug = decodeURIComponent(clean.slice("/categories/".length));
    return slug.replace(/-/g, " ") || "تصنيف";
  }
  if (ARTICLE_PATH.test(path) || ARTICLE_PATH.test(clean)) {
    const slug = decodeURIComponent(clean.split("/").pop() ?? "");
    return slug.replace(/-/g, " ") || "مقال";
  }
  const last = decodeURIComponent(
    clean.split("/").filter(Boolean).pop() ?? "",
  );
  return last.replace(/-/g, " ") || "صفحة";
}

function isUsefulTitle(title: string, path: string): boolean {
  if (!title) return false;
  const normalized = title.trim();
  if (!normalized || normalized === "/" || normalized === "(not set)") {
    return false;
  }
  if (normalized === path || normalized === path.replace(/\/+$/, "")) {
    return false;
  }
  return true;
}

function toPageRow(row: unknown): AnalyticsPageRow {
  const record = asRecord(row) ?? {};
  const nested = asRecord(record.page) ?? asRecord(record.screen);
  const source = nested ? { ...nested, ...record } : record;
  const rawPath = pickString(source, [
    "path",
    "page_path",
    "pagePath",
    "page",
    "url",
    "page_url",
    "pageUrl",
    "page_location",
    "pageLocation",
    "screen",
    "name",
  ]);
  const title = pickString(source, [
    "page_title",
    "pageTitle",
    "title",
    "label",
    "unifiedScreenName",
    "screen_name",
  ]);
  const views = pickNumber(source, METRIC_KEYS);
  const path = normalizePath(rawPath);
  return {
    path,
    label: isUsefulTitle(title, path) ? title : humanizePath(path),
    views,
  };
}

function mergePageRows(rows: AnalyticsPageRow[]): AnalyticsPageRow[] {
  const byPath = new Map<string, AnalyticsPageRow>();
  for (const row of rows) {
    const current = byPath.get(row.path);
    if (!current) {
      byPath.set(row.path, { ...row });
      continue;
    }
    current.views += row.views;
    if (
      isUsefulTitle(row.label, row.path) &&
      !isUsefulTitle(current.label, current.path)
    ) {
      current.label = row.label;
    }
  }
  return [...byPath.values()];
}

function normalizePageRows(rows: unknown): unknown[] {
  if (Array.isArray(rows)) return rows;
  const record = asRecord(rows);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data;
  return Object.entries(record).map(([path, views]) => ({ path, views }));
}

export function mapTopPages(rows: unknown): AnalyticsPageRow[] {
  return mergePageRows(normalizePageRows(rows).map(toPageRow))
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

export function mapTopArticles(rows: unknown): AnalyticsPageRow[] {
  return mergePageRows(normalizePageRows(rows).map(toPageRow))
    .filter((item) => item.views > 0 && isArticleAnalyticsPath(item.path))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
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

function mergeNamedValues(
  items: HorizontalBarChartItem[],
): HorizontalBarChartItem[] {
  const byName = new Map<string, number>();
  for (const item of items) {
    byName.set(item.name, (byName.get(item.name) ?? 0) + item.value);
  }
  return [...byName.entries()].map(([name, value]) => ({ name, value }));
}

export function mapReferrers(
  rows: AdminAnalyticsReferrer[],
): HorizontalBarChartItem[] {
  return mergeNamedValues(
    rows.map((row) => {
      const record = row as Record<string, unknown>;
      return {
        name: humanizeSource(
          pickString(record, ["source", "sessionSource", "referrer", "name"]),
        ),
        value: pickNumber(record, METRIC_KEYS),
      };
    }),
  )
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function mapDevices(rows: AdminAnalyticsDevice[]): DonutChartItem[] {
  return rows
    .map((row, index) => {
      const record = row as Record<string, unknown>;
      return {
        name: humanizeDevice(
          pickString(record, ["device", "deviceCategory", "name"], "غير معروف"),
        ),
        value: pickNumber(record, METRIC_KEYS),
        color: donutColor(index),
      };
    })
    .filter((item) => item.value > 0);
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

export function mapCountries(
  rows: AdminAnalyticsCountry[],
): HorizontalBarChartItem[] {
  return mergeNamedValues(
    rows.map((row) => {
      const record = row as Record<string, unknown>;
      return {
        name: humanizeCountry(
          pickString(record, ["country", "name"], "غير معروف"),
        ),
        value: pickNumber(record, METRIC_KEYS),
      };
    }),
  )
    .filter((item) => item.name && item.name !== "غير معروف")
    .sort((a, b) => b.value - a.value);
}
