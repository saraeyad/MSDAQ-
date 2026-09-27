import {
  isTheme,
  readInitialTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme/types";

export const THEME_COOKIE_NAME = "sabbara-theme";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseThemeFromCookie(
  cookieHeader: string | null | undefined,
): Theme | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, rawValue] = part.trim().split("=");
    if (rawKey?.trim() !== THEME_COOKIE_NAME) continue;
    const value = decodeURIComponent(rawValue ?? "").trim();
    if (isTheme(value)) return value;
  }
  return null;
}

export function persistTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function readThemeForSsr(
  cookieHeader: string | null | undefined,
): Theme {
  return parseThemeFromCookie(cookieHeader) ?? "light";
}

export function applyThemeClass(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

/** Inline boot script source — must stay in sync with readInitialTheme(). */
export const THEME_BOOT_SCRIPT = `(function(){try{var k="sabbara-theme:v1",c="sabbara-theme",t=null,m=document.cookie.match(new RegExp("(?:^|; )"+c+"=([^;]*)"));if(m)t=decodeURIComponent(m[1]);if(t!=="light"&&t!=="dark"){t=localStorage.getItem(k);}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var h=document.documentElement;h.classList.remove("light","dark");h.classList.add(t);h.style.colorScheme=t;}catch(e){}})();`;

export { readInitialTheme };
