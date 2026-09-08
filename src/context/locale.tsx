import {
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  LOCALE_SWITCH_READY,
  readStoredLocale,
  type Locale,
} from "@/lib/i18n/types";
import { getPublicCopy, type PublicCopy } from "@/lib/i18n/public-dictionary";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface LocaleContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  lang: string;
  ogLocale: string;
  copy: PublicCopy;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyDocumentLocale(locale: Locale) {
  const meta = LOCALE_META[locale];
  document.documentElement.lang = meta.lang;
  document.documentElement.dir = meta.dir;
  document.body.dir = meta.dir;
  const root = document.getElementById("root");
  if (root) root.dir = meta.dir;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    if (!LOCALE_SWITCH_READY) return;
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ar" ? "en" : "ar");
  }, [locale, setLocale]);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const meta = LOCALE_META[locale];
    return {
      locale,
      dir: meta.dir,
      lang: meta.lang,
      ogLocale: meta.ogLocale,
      copy: getPublicCopy(locale),
      setLocale,
      toggleLocale,
    };
  }, [locale, setLocale, toggleLocale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function usePublicCopy(): PublicCopy {
  return useLocale().copy;
}
