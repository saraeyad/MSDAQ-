import { useLocale, usePublicCopy } from "@/context/locale";
import { isPublicArticleTranslated } from "@/lib/i18n/public-article-locale";
import { cn } from "@/lib/utils";
import type { PublicArticle } from "@/types";

export function PublicArticleEnglishPendingBadge({
  className,
}: {
  className?: string;
}) {
  const { article: articleCopy } = usePublicCopy();
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200",
        className,
      )}
    >
      {articleCopy.englishPendingBadge}
    </span>
  );
}

export function isEnglishArticlePending(
  article: Pick<PublicArticle, "is_translated">,
  locale: "ar" | "en",
): boolean {
  return locale === "en" && !isPublicArticleTranslated(article, locale);
}

export function PublicArticleEnglishPendingPanel({
  className,
}: {
  className?: string;
}) {
  const { article: articleCopy } = usePublicCopy();
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-8 text-center",
        className,
      )}
    >
      <p className="font-headline text-xl font-bold md:text-2xl">
        {articleCopy.englishPendingTitle}
      </p>
      <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
        {articleCopy.englishPendingLead}
      </p>
    </div>
  );
}
