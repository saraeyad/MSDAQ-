import type { Locale } from "@/lib/i18n/types";
import { articlePath } from "@/router/routes";

export const ARTICLE_CONTENT_LANG_PARAM = "contentLang";

export function parseArticleContentLang(
  value: string | null | undefined,
): Locale | null {
  return value === "ar" || value === "en" ? value : null;
}

export function otherArticleContentLang(lang: Locale): Locale {
  return lang === "ar" ? "en" : "ar";
}

export function articleContentLangPath(
  id: number | string,
  contentLang: Locale,
  siteLocale: Locale,
): string {
  const path = articlePath(id);
  if (contentLang === siteLocale) return path;
  return `${path}?${ARTICLE_CONTENT_LANG_PARAM}=${contentLang}`;
}
