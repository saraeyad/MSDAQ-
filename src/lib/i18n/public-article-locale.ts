import type { Locale } from "@/lib/i18n/types";
import type { PublicArticle } from "@/types";

/** Whether public article text is safe to show for the active site locale. */
export function isPublicArticleTranslated(
  article: Pick<PublicArticle, "is_translated">,
  locale: Locale,
): boolean {
  if (locale === "ar") return true;
  return article.is_translated === true;
}
