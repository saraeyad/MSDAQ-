import { PageLoading } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { PublicArticleCover } from "@/components/article/cover-image";
import { ArticleVerifiedBadge } from "@/components/article/article-verified-badge";
import {
  isEnglishArticlePending,
  PublicArticleEnglishPendingBadge,
} from "@/features/public-site/components/PublicArticleEnglishPending";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { useLocale, usePublicCopy } from "@/context/locale";
import { useSiteOrigin } from "@/context/site-origin";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { publicMediaTypeLabelFromCopy } from "@/lib/i18n/public-media-labels";
import { siteLogoUrl } from "@/lib/seo/site-url";
import { articlePath, ROUTES } from "@/router/routes";
import { Articles_APIs } from "@/services/api/articles";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function ArticlesListPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const mediaType = params.get("media_type") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const copy = usePublicCopy();
  const { pageHero } = copy;
  const { dir, locale } = useLocale();
  const { common } = copy;
  const origin = useSiteOrigin();
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const { data, isLoading } = useQuery({
    queryKey: ["articles", locale, search, mediaType, page],
    queryFn: () =>
      Articles_APIs.list({
        search: search || undefined,
        media_type: mediaType || undefined,
        page,
        lang: locale,
      }),
  });

  const articles = data?.items ?? [];
  const pagination = data?.pagination;

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    setParams(next);
  };

  const searchQuery = search.trim();
  const isSearchView = searchQuery.length > 0;
  const listTitle = isSearchView
    ? pageHero.searchResults(searchQuery)
    : pageHero.articles;

  return (
    <div className="container-page py-10">
      <PublicPageHead
        head={{
          title: listTitle,
          description: isSearchView ? undefined : pageHero.articlesLead,
          canonical: `${origin}${ROUTES.ARTICLES}`,
          ogType: "website",
          ogImage: siteLogoUrl(origin),
        }}
      />
      {isSearchView ? (
        <>
          <h1 className="section-title">
            {pageHero.searchResults(searchQuery)}
          </h1>
          <p className="section-description">
            {isLoading
              ? pageHero.searching
              : articles.length > 0
                ? pageHero.resultCount(pagination?.total ?? articles.length)
                : pageHero.noSearchResults}
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title">{pageHero.articles}</h1>
          <p className="section-description">{pageHero.articlesLead}</p>
        </>
      )}

      {isLoading ? (
        <PageLoading className="mt-8" />
      ) : articles.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          {isSearchView
            ? pageHero.noResultsFor(searchQuery)
            : pageHero.noArticles}
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => {
              const englishPending = isEnglishArticlePending(article, locale);
              return (
                <article
                  key={article.id}
                  className="content-card articles-list-card overflow-hidden"
                >
                  <Link to={articlePath(article.id)} className="block">
                    {article.cover_image ? (
                      <PublicArticleCover
                        article={article}
                        priority={index === 0}
                        className="aspect-video w-full object-cover"
                      />
                    ) : null}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-primary">
                          {(article.category
                            ? localizedCategoryName(article.category, locale)
                            : null) ??
                            publicMediaTypeLabelFromCopy(
                              copy,
                              article.media_type,
                            )}
                        </span>
                      </div>
                      <h2 className="mt-1 font-headline text-lg font-semibold">
                        {englishPending ? (
                          <PublicArticleEnglishPendingBadge />
                        ) : (
                          <span className="inline-flex flex-wrap items-center gap-2">
                            <span className="line-clamp-3">{article.title}</span>
                            <ArticleVerifiedBadge article={article} compact />
                          </span>
                        )}
                      </h2>
                      {!englishPending && article.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {article.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <PrevIcon className="size-4" />
                {common.previous}
              </Button>
              <span className="text-sm text-muted-foreground">
                {common.pageOf(pagination.current_page, pagination.last_page)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.last_page}
                onClick={() => setPage(page + 1)}
              >
                {common.next}
                <NextIcon className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
