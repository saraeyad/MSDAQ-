import { categoryPath } from "@/router/routes";
import type { CategorySeo, PublicCategory, PublicPagination } from "@/types";
import { absoluteUrl } from "./site-url";
import type { JsonLdGraph, SeoHeadPayload } from "./types";

const SITE_NAME = "مِصداق";

function rewriteBreadcrumbUrl(
  url: string | null,
  origin?: string,
): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return absoluteUrl(`${parsed.pathname}${parsed.search}`, origin);
  } catch {
    return url.startsWith("/") ? absoluteUrl(url, origin) : url;
  }
}

function buildBreadcrumbList(
  seo: CategorySeo | undefined,
  origin?: string,
): Record<string, unknown> | null {
  if (!seo?.breadcrumbs?.length) return null;

  return {
    "@type": "BreadcrumbList",
    itemListElement: seo.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: rewriteBreadcrumbUrl(crumb.url, origin),
    })),
  };
}

function categoryPagePath(slug: string, page: number): string {
  if (page <= 1) return categoryPath(slug);
  return `${categoryPath(slug)}?page=${page}`;
}

export function buildCategoryPaginationLinks(
  slug: string,
  pagination: PublicPagination | undefined,
  origin?: string,
): Pick<SeoHeadPayload, "prev" | "next"> {
  if (!pagination || pagination.last_page <= 1) {
    return {};
  }

  const { current_page, last_page } = pagination;
  const links: Pick<SeoHeadPayload, "prev" | "next"> = {};

  if (current_page > 1) {
    links.prev = absoluteUrl(
      categoryPagePath(slug, current_page - 1),
      origin,
    );
  }

  if (current_page < last_page) {
    links.next = absoluteUrl(
      categoryPagePath(slug, current_page + 1),
      origin,
    );
  }

  return links;
}

export function buildCategorySeoHead(
  category: Pick<PublicCategory, "slug" | "name_ar" | "description" | "seo">,
  options?: {
    page?: number;
    origin?: string;
    pagination?: PublicPagination;
  },
): SeoHeadPayload {
  const page = options?.page ?? 1;
  const origin = options?.origin;
  const seo = category.seo;

  const title = seo?.meta_title ?? `${category.name_ar} | ${SITE_NAME}`;
  const description =
    seo?.meta_description ?? category.description ?? undefined;
  const canonical = absoluteUrl(categoryPagePath(category.slug, page), origin);
  const paginationLinks = buildCategoryPaginationLinks(
    category.slug,
    options?.pagination,
    origin,
  );

  return {
    title,
    description,
    canonical,
    ogType: seo?.og_type ?? "website",
    ...paginationLinks,
  };
}

export function buildCategoryJsonLd(
  category: Pick<PublicCategory, "seo">,
  origin?: string,
): JsonLdGraph {
  const graph: Record<string, unknown>[] = [];
  const breadcrumbs = buildBreadcrumbList(category.seo, origin);

  if (breadcrumbs) {
    graph.push(breadcrumbs);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
