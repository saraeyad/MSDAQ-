declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Same property as the gtag snippet in `index.html`. */
const MEASUREMENT_ID = "G-MNNV05NB2B";

const ARTICLE_PATH = /^\/articles\/[^/]+$/;
const STAFF_PATH = /^\/(newsroom|admin|login)(\/|$)/;

let lastPagePath: string | null = null;
let lastArticleId: string | null = null;
let gtagConfigured = false;

export function isPublicArticlePath(pathname: string): boolean {
  return ARTICLE_PATH.test(pathname);
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

/** Public-site traffic only. Staff workspace and local dev stay out of GA. */
export function shouldSendAnalytics(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  if (isLocalHost(window.location.hostname)) return false;
  if (STAFF_PATH.test(pathname)) return false;
  return true;
}

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.gtag?.(...args);
}

function ensureGtagConfigured(): void {
  if (typeof window === "undefined" || gtagConfigured) return;

  window.dataLayer ??= [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments);
    };
  }

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
    gtag("js", new Date());
    gtag("config", MEASUREMENT_ID, { send_page_view: false });
  }

  gtagConfigured = true;
}

export function trackPageView(path: string, title?: string): void {
  const pagePath = normalizePath(path);
  if (!shouldSendAnalytics(pagePath)) return;
  if (lastPagePath === pagePath) return;
  lastPagePath = pagePath;

  ensureGtagConfigured();
  gtag("event", "page_view", {
    send_to: MEASUREMENT_ID,
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: title || document.title,
  });
}

export function trackArticleView(input: {
  id: number | string;
  title: string;
  path: string;
}): void {
  const id = String(input.id);
  const pagePath = normalizePath(input.path);
  if (!shouldSendAnalytics(pagePath)) return;

  if (lastArticleId !== id) {
    lastArticleId = id;
    ensureGtagConfigured();
    gtag("event", "article_view", {
      send_to: MEASUREMENT_ID,
      article_id: id,
      page_path: pagePath,
      page_location: `${window.location.origin}${pagePath}`,
      page_title: input.title,
      content_group: "article",
    });
  }

  trackPageView(pagePath, input.title);
}

export function resetArticleViewDedupe(pathname: string): void {
  if (!isPublicArticlePath(pathname)) {
    lastArticleId = null;
  }
}
