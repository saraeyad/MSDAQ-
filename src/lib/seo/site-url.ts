import { BRAND_LOGO_FULL, BRAND_LOGO_META } from "@/components/brand/brand-logo";

const DEFAULT_SITE_URL = "https://misdaq.ps";

/** Absolute URL for favicon / default share image. */
export function siteLogoUrl(origin?: string): string {
  return absoluteUrl(BRAND_LOGO_META, origin);
}

export function siteFaviconHref(): string {
  return BRAND_LOGO_FULL;
}

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
