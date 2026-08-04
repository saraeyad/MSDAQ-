import type { LangVariant } from "@/features/public-site/article-page/types";
import type { PublicArticle } from "@/types";

export function resolveArticleBody(
  article: PublicArticle,
  lang: LangVariant,
): string {
  const { content } = article;

  if (lang === "simplified" && content.simplified?.trim()) {
    return content.simplified;
  }
  if (lang === "dialect" && content.dialect?.trim()) {
    return content.dialect;
  }
  if (content.formal?.trim()) {
    return content.formal;
  }
  if (article.description?.trim()) {
    return article.description;
  }
  return "";
}

export function hasLanguageVariant(
  article: PublicArticle,
  lang: LangVariant,
): boolean {
  if (lang === "formal") return Boolean(article.content.formal?.trim());
  if (lang === "simplified") return Boolean(article.content.simplified?.trim());
  return Boolean(article.content.dialect?.trim());
}
