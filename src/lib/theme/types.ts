export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "sabbara-theme:v1";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function readSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* ignore */
  }
  return null;
}

/** Effective theme on first paint: stored choice, else system preference. */
export function readInitialTheme(): Theme {
  return readStoredTheme() ?? readSystemTheme();
}
