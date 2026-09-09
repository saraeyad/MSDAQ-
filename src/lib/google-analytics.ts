declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Same property as the gtag snippet in `index.html`. */
const MEASUREMENT_ID = "G-MNNV05NB2B";

const ARTICLE_PATH = /^\/articles\/[^/]+$/;

let lastPagePath: string | null =
  typeof window !== "undefined"
    ? `${window.location.pathname}${window.location.search}`
    : null;
let lastArticleId: string | null = null;

export function isPublicArticlePath(pathname: string): boolean {
  return ARTICLE_PATH.test(pathname);
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  window.gtag?.(...args);
}

export function trackPageView(path: string, title?: string): void {
  const pagePath = normalizePath(path);
  if (lastPagePath === pagePath) return;
  lastPagePath = pagePath;

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

  if (lastArticleId !== id) {
    lastArticleId = id;
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
