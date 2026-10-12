export const STAGING_API_URL = "https://api.staging.sabbarapost.org";
export const PRODUCTION_API_URL = "https://api.sabbarapost.org";
export const API_TARGET_COOKIE = "sabbara-api-target";

/** Staging unless the dev cookie selects production. */
export function apiUrlFromCookie(cookie?: string): string {
  return cookie?.includes(`${API_TARGET_COOKIE}=production`)
    ? PRODUCTION_API_URL
    : STAGING_API_URL;
}
