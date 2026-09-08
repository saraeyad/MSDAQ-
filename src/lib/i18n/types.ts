export type Locale = "ar" | "en";

export const LOCALE_STORAGE_KEY = "sabbara-locale:v1";

/** Public language switch — turn on when English copy is ready. */
export const LOCALE_SWITCH_READY = false;

export const LOCALE_META: Record<
  Locale,
  { dir: "rtl" | "ltr"; lang: string; ogLocale: string; label: string }
> = {
  ar: { dir: "rtl", lang: "ar", ogLocale: "ar_PS", label: "العربية" },
  en: { dir: "ltr", lang: "en", ogLocale: "en_US", label: "English" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ar" || value === "en";
}

export function readStoredLocale(): Locale {
  if (!LOCALE_SWITCH_READY) return "ar";
  if (typeof window === "undefined") return "ar";
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "ar";
}
