import { PageLoading } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { PublicArticleCover } from "@/components/article/cover-image";
import { ArticleVerifiedBadge } from "@/components/article/article-verified-badge";
import { useLocale, usePublicCopy } from "@/context/locale";
import { publicMediaTypeLabel } from "@/lib/media";
import { articlePath } from "@/router/routes";
import { Articles_APIs } from "@/services/api/articles";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function ArticlesListPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const mediaType = params.get("media_type") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const { pageHero } = usePublicCopy();
  const { dir } = useLocale();
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const { data, isLoading } = useQuery({
    queryKey: ["articles", search, mediaType, page],
    queryFn: () =>
      Articles_APIs.list({
        search: search || undefined,
        media_type: mediaType || undefined,
        page,
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

  return (
    <div className="container-page py-10">
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
            {articles.map((article, index) => (
              <Link
                key={article.id}
                to={articlePath(article.id)}
                className="content-card overflow-hidden"
              >
                {article.cover_image || article.images?.length ? (
                  <PublicArticleCover
                    article={article}
                    priority={index === 0}
                    className="aspect-video w-full object-cover"
                  />
                ) : null}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-primary">
                      {article.category?.name_ar ??
                        publicMediaTypeLabel(article.media_type)}
                    </span>
                  </div>
                  <h2 className="mt-1 inline-flex flex-wrap items-center gap-2 font-headline text-lg font-semibold">
                    {article.title}
                    <ArticleVerifiedBadge article={article} compact />
                  </h2>
                  {article.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {article.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
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
                {dir === "rtl" ? "السابق" : "Previous"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {dir === "rtl"
                  ? `صفحة ${pagination.current_page} من ${pagination.last_page}`
                  : `Page ${pagination.current_page} of ${pagination.last_page}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.last_page}
                onClick={() => setPage(page + 1)}
              >
                {dir === "rtl" ? "التالي" : "Next"}
                <NextIcon className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
