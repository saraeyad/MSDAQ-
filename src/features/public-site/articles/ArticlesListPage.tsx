import { PageLoading } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { CategoryStoryBoard } from "@/features/public-site/categories/CategoryStories";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { useLocale, usePublicCopy } from "@/context/locale";
import { useSiteOrigin } from "@/context/site-origin";
import { siteLogoUrl } from "@/lib/seo/site-url";
import { ROUTES } from "@/router/routes";
import { Articles_APIs } from "@/services/api/articles";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";

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
      <header className="articles-index__head">
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
      </header>

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
          <CategoryStoryBoard articles={articles} />

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
