import type { CategorySeo } from "@/types";
import type { JsonLdGraph, SeoHeadPayload } from "./types";

function buildBreadcrumbList(seo: CategorySeo): Record<string, unknown> | null {
  if (!seo.breadcrumbs?.length) return null;

  return {
    "@type": "BreadcrumbList",
    itemListElement: seo.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function buildCategorySeoHead(seo: CategorySeo): SeoHeadPayload {
  return {
    title: seo.meta_title,
    description: seo.meta_description,
    canonical: seo.canonical,
    ogType: seo.og_type,
  };
}

export function buildCategoryJsonLd(seo: CategorySeo): JsonLdGraph {
  const graph: Record<string, unknown>[] = [];
  const breadcrumbs = buildBreadcrumbList(seo);

  if (breadcrumbs) {
    graph.push(breadcrumbs);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
