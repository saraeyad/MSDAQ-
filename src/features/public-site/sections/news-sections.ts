import { ROUTES } from "@/router/routes";

/** Static editorial page paths — copy lives in the public dictionary. */
export const STATIC_SECTION_PATHS = [
  ROUTES.RUYA,
  ROUTES.PUBLICATIONS,
  ROUTES.PUBLICATIONS_REPORTS,
  ROUTES.PUBLICATIONS_BOOKS,
  ROUTES.DATA_INFO,
] as const;

export const STATIC_SECTIONS = STATIC_SECTION_PATHS.map((path) => ({ path }));
