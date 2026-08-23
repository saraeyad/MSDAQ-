export const ROUTES = {
  HOME: "/",
  ARTICLES: "/articles",
  ARTICLE: "/articles/:id",
  CATEGORY: "/categories/:slug",
  RUYA: "/ruya",
  PUBLICATIONS: "/publications",
  PUBLICATIONS_REPORTS: "/publications/reports",
  PUBLICATIONS_BOOKS: "/publications/books",
  DATA_INFO: "/data-info",
  ABOUT: "/about",
  PARTNERS: "/partners",
  WHO_WE_ARE: "/who-we-are",
  CONTACT: "/contact",
  SITE_POLICY: "/site-policy",
  TERMS: "/terms",
  TOOLS_OVERVIEW: "/tools-overview",
  LOGIN: "/login",

  NEWSROOM: "/newsroom",
  NEWSROOM_ARTICLES: "/newsroom/articles",
  NEWSROOM_ARTICLE_VIEW: "/newsroom/articles/:id",
  NEWSROOM_ARTICLE_NEW: "/newsroom/articles/new",
  NEWSROOM_ARTICLE_EDIT: "/newsroom/articles/:id/edit",
  NEWSROOM_TOOLS: "/newsroom/tools",
  NEWSROOM_TOOL: "/newsroom/tools/:tool",
  NEWSROOM_CALENDAR: "/newsroom/calendar",
  NEWSROOM_LIBRARY: "/newsroom/library",
  NEWSROOM_TRUST_INDEX: "/newsroom/trust-index",
  NEWSROOM_PLATFORM_FEEDBACK: "/newsroom/platform-feedback",

  ADMIN: "/admin",
  ADMIN_TEAM: "/admin/team",
  ADMIN_ROLES: "/admin/roles",
  ADMIN_ROLE_EDIT: "/admin/roles/:id/edit",
  ADMIN_CALENDAR: "/admin/calendar",
  ADMIN_LIBRARY: "/admin/library",
  ADMIN_CATEGORIES: "/admin/categories",
} as const;

/** Public category section URL (Collection 02 · Public). */
export function categoryPath(slug: string): string {
  return `/categories/${slug}`;
}

/** Public article detail URL (Collection 02 · Public). */
export function articlePath(id: number | string): string {
  return `/articles/${id}`;
}

/** Staff newsroom article detail URL. */
export function staffArticlePath(id: number | string): string {
  return `/newsroom/articles/${id}`;
}

export const ARTICLE_TRUST_FEEDBACK_HASH = "article-trust-feedback";

/** Staff article trust index section anchor. */
export function staffArticleTrustFeedbackPath(id: number | string): string {
  return `${staffArticlePath(id)}#${ARTICLE_TRUST_FEEDBACK_HASH}`;
}

/** Admin role permissions editor URL. */
export function adminRoleEditPath(id: number | string): string {
  return `/admin/roles/${id}/edit`;
}

export { PERMISSIONS, SUPER_ADMIN_ROLE } from "@/router/permissions";
