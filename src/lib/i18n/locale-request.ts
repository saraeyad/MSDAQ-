import {
  isLocale,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
  type Locale,
} from "@/lib/i18n/types";

export const LOCALE_COOKIE_NAME = "sabbara-locale";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function isPublicApiRequestUrl(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.startsWith("http")
    ? new URL(url).pathname
    : url.split("?")[0] ?? url;
  return path.includes("/api/public") || path.includes("/api/pages");
}

export function resolveAcceptLanguageForRequest(url: string | undefined): Locale {
  if (!isPublicApiRequestUrl(url)) return "ar";
  return readStoredLocale();
}

export function parseLocaleFromCookie(
  cookieHeader: string | null | undefined,
): Locale | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, rawValue] = part.trim().split("=");
    if (rawKey?.trim() !== LOCALE_COOKIE_NAME) continue;
    const value = decodeURIComponent(rawValue ?? "").trim();
    if (isLocale(value)) return value;
  }
  return null;
}

export function persistPublicLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function readLocaleForSsr(cookieHeader: string | null | undefined): Locale {
  return parseLocaleFromCookie(cookieHeader) ?? "ar";
}
