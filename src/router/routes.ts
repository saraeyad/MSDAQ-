export const ROUTES = {
  HOME: "/",
  ARTICLES: "/articles",
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

  ADMIN: "/admin",
  ADMIN_TEAM: "/admin/team",
  ADMIN_ROLES: "/admin/roles",
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

export { PERMISSIONS, SUPER_ADMIN_ROLE } from "@/router/permissions";
