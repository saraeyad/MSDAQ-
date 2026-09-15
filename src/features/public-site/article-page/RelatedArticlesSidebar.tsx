import { PublicArticleCover } from "@/components/article/cover-image";
import {
  isEnglishArticlePending,
  PublicArticleEnglishPendingBadge,
} from "@/features/public-site/components/PublicArticleEnglishPending";
import { useLocale, usePublicCopy } from "@/context/locale";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { publicMediaTypeLabelFromCopy } from "@/lib/i18n/public-media-labels";
import { sameArticleId } from "@/lib/publishing";
import { cn } from "@/lib/utils";
import { articlePath } from "@/router/routes";
import { Articles_APIs } from "@/services/api/articles";
import type { PublicArticle } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const RELATED_LIMIT = 5;

async function fetchRelatedArticles(
  article: PublicArticle,
  lang: "ar" | "en",
): Promise<PublicArticle[]> {
  const excludeId = article.id;

  if (article.category?.id) {
    const byCategory = await Articles_APIs.list({
      category: article.category.id,
      page: 1,
      lang,
    });
    const related = byCategory.items.filter(
      (item) => !sameArticleId(item.id, excludeId),
    );
    if (related.length > 0) {
      return related.slice(0, RELATED_LIMIT);
    }
  }

  const latest = await Articles_APIs.list({ latest: true, lang });
  return latest.items
    .filter((item) => !sameArticleId(item.id, excludeId))
    .slice(0, RELATED_LIMIT);
}

export function RelatedArticlesSidebar({
  article,
  className,
}: {
  article: PublicArticle;
  className?: string;
}) {
  const { locale } = useLocale();
  const copy = usePublicCopy();
  const { article: articleCopy } = copy;
  const dateLocale = locale === "ar" ? "ar" : "en-GB";

  const { data: related = [], isLoading } = useQuery({
    queryKey: ["related-articles", locale, article.id, article.category?.id],
    queryFn: () => fetchRelatedArticles(article, locale),
  });

  return (
    <aside className={cn("space-y-4", className)}>
      <h2 className="font-headline text-lg font-bold">
        {articleCopy.relatedTitle}
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : related.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {articleCopy.relatedEmpty}
        </p>
      ) : (
        <ul className="space-y-3">
          {related.map((item) => {
            const itemPending = isEnglishArticlePending(item, locale);
            return (
            <li key={item.id}>
              <Link
                to={articlePath(item.id)}
                className="group flex gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
              >
                <PublicArticleCover
                  article={item}
                  alt=""
                  className="size-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-primary">
                    {(item.category
                      ? localizedCategoryName(item.category, locale)
                      : null) ??
                      publicMediaTypeLabelFromCopy(copy, item.media_type)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                    {itemPending ? (
                      <PublicArticleEnglishPendingBadge />
                    ) : (
                      item.title
                    )}
                  </p>
                  <time className="mt-1 block text-xs text-muted-foreground">
                    {new Date(item.published_at).toLocaleDateString(dateLocale)}
                  </time>
                </div>
              </Link>
            </li>
          );
          })}
        </ul>
      )}
    </aside>
  );
}
