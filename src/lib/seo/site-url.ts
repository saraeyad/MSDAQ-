const DEFAULT_SITE_URL = "https://misdaq.ps";

export function getSiteOrigin(requestOrigin?: string): string {
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  return (configured || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function absoluteUrl(path: string, origin?: string): string {
  const base = getSiteOrigin(origin);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
