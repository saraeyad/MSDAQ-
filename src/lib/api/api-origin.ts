import { STAGING_API_URL } from "./api-targets";

export const DEFAULT_API_URL = STAGING_API_URL;

/** Absolute API origin (no trailing slash). */
export function apiOrigin(): string {
  const base = import.meta.env.VITE_HOST_API || DEFAULT_API_URL;
  try {
    return new URL(base).origin;
  } catch {
    return DEFAULT_API_URL;
  }
}

/** Axios/fetch base URL — empty in dev when using Vite proxy. */
export function apiBaseUrl(): string {
  return (
    import.meta.env.VITE_HOST_API ||
    (import.meta.env.DEV ? "" : DEFAULT_API_URL)
  );
}
