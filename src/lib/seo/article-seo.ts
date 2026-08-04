import { articlePath } from "@/router/routes";
import type { PublicArticle } from "@/types";
import { absoluteUrl } from "./site-url";
import type { JsonLdGraph, SeoHeadPayload } from "./types";

function buildBreadcrumbList(
  article: PublicArticle,
  currentUrl: string,
): Record<string, unknown> | null {
  const breadcrumbs = article.seo?.breadcrumbs;
  if (!breadcrumbs?.length) return null;

  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url ?? currentUrl,
    })),
  };
}

function buildNewsArticle(
  article: PublicArticle,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.published_at,
    dateModified: article.published_at,
    inLanguage: "ar",
  };

  if (article.cover_image) {
    schema.image = [article.cover_image];
  }

  if (article.author?.name) {
    schema.author = [{ "@type": "Person", name: article.author.name }];
  }

  if (article.seo?.article_section) {
    schema.articleSection = article.seo.article_section;
  }

  return schema;
}

export function buildArticleSeoHead(
  article: PublicArticle,
  origin?: string,
): SeoHeadPayload {
  const currentUrl = absoluteUrl(articlePath(article.id), origin);

  return {
    title: article.title,
    description: article.description,
    canonical: currentUrl,
    ogType: "article",
    ogImage: article.cover_image,
  };
}

export function buildArticleJsonLd(
  article: PublicArticle,
  origin?: string,
): JsonLdGraph {
  const currentUrl = absoluteUrl(articlePath(article.id), origin);
  const graph: Record<string, unknown>[] = [buildNewsArticle(article)];

  const breadcrumbs = buildBreadcrumbList(article, currentUrl);
  if (breadcrumbs) {
    graph.push(breadcrumbs);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
