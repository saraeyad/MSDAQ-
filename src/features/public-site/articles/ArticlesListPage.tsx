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
import type { PublicArticle } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

function articleKicker(
  article: PublicArticle,
  locale: "ar" | "en",
  copy: ReturnType<typeof usePublicCopy>,
) {
  return (
    (article.category
      ? localizedCategoryName(article.category, locale)
      : null) ?? publicMediaTypeLabelFromCopy(copy, article.media_type)
  );
}

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
          <ArticlesNewsSplit articles={articles} locale={locale} copy={copy} />

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

type Copy = ReturnType<typeof usePublicCopy>;

function publishedLabel(article: PublicArticle, locale: "ar" | "en") {
  return new Date(article.published_at).toLocaleDateString(
    locale === "en" ? "en" : "ar",
  );
}

function ArticleTitle({
  article,
  locale,
  className,
}: {
  article: PublicArticle;
  locale: "ar" | "en";
  className: string;
}) {
  const englishPending = isEnglishArticlePending(article, locale);
  return (
    <h2 className={className}>
      <Link to={articlePath(article.id)} className="font-headline">
        {englishPending ? <PublicArticleEnglishPendingBadge /> : article.title}
      </Link>
    </h2>
  );
}

/** Lead, text rail, photo row, then a two-column headline list. */
function ArticlesNewsSplit({
  articles,
  locale,
  copy,
}: {
  articles: PublicArticle[];
  locale: "ar" | "en";
  copy: Copy;
}) {
  const lead = articles[0];
  const rail = articles.slice(1, 5);
  const promos = articles.slice(5, 9);
  const more = articles.slice(9);
  if (!lead) return null;

  const leadPending = isEnglishArticlePending(lead, locale);

  return (
    <div className="articles-index">
      <div className="articles-index__pack">
        <article className="articles-index__lead">
          <Link to={articlePath(lead.id)} className="articles-index__lead-media">
            <PublicArticleCover
              article={lead}
              priority
              className="articles-index__cover"
            />
          </Link>
          <p className="articles-index__kicker">
            {articleKicker(lead, locale, copy)}
          </p>
          <ArticleTitle
            article={lead}
            locale={locale}
            className="articles-index__lead-title"
          />
          {!leadPending ? (
            <ArticleVerifiedBadge
              article={lead}
              compact
              className="articles-index__verified"
            />
          ) : null}
          {!leadPending && lead.description ? (
            <p className="articles-index__lead-summary">{lead.description}</p>
          ) : null}
          <p className="articles-index__meta">
            <time dateTime={lead.published_at}>
              {publishedLabel(lead, locale)}
            </time>
          </p>
        </article>

        {rail.length > 0 ? (
          <div className="articles-index__rail">
            {rail.map((article) => {
              const pending = isEnglishArticlePending(article, locale);
              return (
                <article key={article.id} className="articles-index__rail-item">
                  <ArticleTitle
                    article={article}
                    locale={locale}
                    className="articles-index__rail-title"
                  />
                  {!pending ? (
                    <ArticleVerifiedBadge article={article} compact />
                  ) : null}
                  {!pending && article.description ? (
                    <p className="articles-index__rail-summary">
                      {article.description}
                    </p>
                  ) : null}
                  <p className="articles-index__kicker">
                    {articleKicker(article, locale, copy)}
                    <time dateTime={article.published_at}>
                      {publishedLabel(article, locale)}
                    </time>
                  </p>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>

      {promos.length > 0 ? (
        <div className="articles-index__promos">
          {promos.map((article) => (
            <article key={article.id} className="articles-index__promo">
              <Link
                to={articlePath(article.id)}
                className="articles-index__promo-media"
              >
                <PublicArticleCover
                  article={article}
                  className="articles-index__cover"
                />
              </Link>
              <p className="articles-index__kicker">
                {articleKicker(article, locale, copy)}
              </p>
              <ArticleTitle
                article={article}
                locale={locale}
                className="articles-index__promo-title"
              />
            </article>
          ))}
        </div>
      ) : null}

      {more.length > 0 ? (
        <div className="articles-index__more">
          {more.map((article) => (
            <article key={article.id} className="articles-index__more-item">
              <Link
                to={articlePath(article.id)}
                className="articles-index__more-media"
              >
                <PublicArticleCover
                  article={article}
                  className="articles-index__cover"
                />
              </Link>
              <div>
                <p className="articles-index__kicker">
                  {articleKicker(article, locale, copy)}
                  <time dateTime={article.published_at}>
                    {publishedLabel(article, locale)}
                  </time>
                </p>
                <ArticleTitle
                  article={article}
                  locale={locale}
                  className="articles-index__more-title"
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
