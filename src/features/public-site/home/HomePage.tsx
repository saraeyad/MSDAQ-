import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import { HomeHero } from "@/features/public-site/home/HomeHero";
import { useLocale, usePublicCopy } from "@/context/locale";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { usePublicCategories } from "@/hooks/public";
import { buildParentSlugMap } from "@/lib/publishing";
import { cn } from "@/lib/utils";
import { Articles_APIs } from "@/services/api/articles";
import type { PublicArticle } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState, useSyncExternalStore } from "react";

const MOBILE_CARD_LIMIT = 6;
const DESKTOP_CARD_MQ = "(min-width: 768px)";

function subscribeDesktopCards(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_CARD_MQ);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function desktopCardsSnapshot() {
  return window.matchMedia(DESKTOP_CARD_MQ).matches;
}

const NewsSlider = lazy(() =>
  import("@/features/public-site/components/news-slider").then((module) => ({
    default: module.NewsSlider,
  })),
);

function matchesFilter(
  article: PublicArticle,
  filterId: string,
  slugSets: Map<string, Set<string>>,
): boolean {
  if (filterId === "all") return true;
  const articleSlug = article.category?.slug;
  if (!articleSlug) return false;
  const allowedSlugs = slugSets.get(filterId);
  return allowedSlugs?.has(articleSlug) ?? articleSlug === filterId;
}

function cardLayout(index: number) {
  if (index === 0)
    return { featured: true, wide: false, className: "sm:col-span-2" };
  if (index === 3)
    return { featured: false, wide: true, className: "lg:col-span-2" };
  return { featured: false, wide: false, className: "" };
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const isDesktop = useSyncExternalStore(
    subscribeDesktopCards,
    desktopCardsSnapshot,
    () => false,
  );
  const { data: categories = [] } = usePublicCategories();
  const { home } = usePublicCopy();
  const { locale } = useLocale();

  const filters = useMemo(
    () => [
      { id: "all", label: home.allFilter },
      ...categories.map((category) => ({
        id: category.slug,
        label: localizedCategoryName(category, locale),
      })),
    ],
    [categories, home.allFilter, locale],
  );

  const parentSlugMap = useMemo(
    () => buildParentSlugMap(categories),
    [categories],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["home-articles", locale],
    queryFn: () => Articles_APIs.list({ latest: true, lang: locale }),
  });

  const articles = data?.items ?? [];

  const filteredArticles = useMemo(
    () => articles.filter((a) => matchesFilter(a, activeFilter, parentSlugMap)),
    [articles, activeFilter, parentSlugMap],
  );

  const showAllMobile = expandedFilter === activeFilter;
  const visibleArticles =
    isDesktop || showAllMobile
      ? filteredArticles
      : filteredArticles.slice(0, MOBILE_CARD_LIMIT);
  const canShowMore =
    !isDesktop && !showAllMobile && filteredArticles.length > MOBILE_CARD_LIMIT;

  return (
    <div>
      <HomeHero />

      <section className="home-news-rail" aria-label={home.nowLabel}>
        <div className="container-page">
          {isLoading ? (
            <div className="news-rail news-rail--skeleton" aria-hidden />
          ) : articles.length === 0 ? (
            <div className="news-rail news-rail--empty">{home.noArticles}</div>
          ) : (
            <Suspense fallback={<div className="news-rail news-rail--skeleton" aria-hidden />}>
              <NewsSlider articles={articles} variant="rail" />
            </Suspense>
          )}
        </div>
      </section>

      <section
        className="home-latest relative overflow-hidden py-10 md:py-14"
        aria-labelledby="home-latest-title"
      >
        <div className="pointer-events-none absolute inset-0 news-section-bg" />

        <div className="container-page relative">
          <div className="home-latest-masthead">
            <span className="home-latest-masthead__corner home-latest-masthead__corner--tl" />
            <span className="home-latest-masthead__corner home-latest-masthead__corner--tr" />
            <span className="home-latest-masthead__corner home-latest-masthead__corner--bl" />
            <span className="home-latest-masthead__corner home-latest-masthead__corner--br" />

            <h2 id="home-latest-title" className="home-latest-masthead__title">
              <span className="home-latest-masthead__title-line">
                {home.latestTitleLine}
              </span>
              <span className="home-latest-masthead__title-accent">
                {home.latestTitleAccent}
              </span>
            </h2>

            <span className="home-latest-masthead__rule" aria-hidden />

            <p className="home-latest-masthead__lead">{home.latestLead}</p>
          </div>

          {articles.length > 0 && (
            <nav className="home-latest-filters" aria-label={home.latestTitle}>
              {filters.map((filter) => {
                const active = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "home-latest-filters__item",
                      active && "home-latest-filters__item--active",
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </nav>
          )}

          <div className="mt-10">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[280px] animate-pulse rounded-2xl bg-muted/80",
                      i === 0 && "sm:col-span-2",
                      i === 3 && "lg:col-span-2",
                    )}
                  />
                ))}
              </div>
            ) : articles.length === 0 ? null : filteredArticles.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                {activeFilter !== "all"
                  ? home.filterEmpty(
                      filters.find((f) => f.id === activeFilter)?.label ??
                        activeFilter,
                    )
                  : home.noFilterMatch}
              </p>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleArticles.map((article, index) => {
                    const layout = cardLayout(index);
                    return (
                      <HomeArticleCard
                        key={article.id}
                        article={article}
                        index={index}
                        featured={layout.featured}
                        wide={layout.wide}
                        className={layout.className}
                      />
                    );
                  })}
                </div>
                {canShowMore ? (
                  <button
                    type="button"
                    className="home-latest-more"
                    onClick={() => setExpandedFilter(activeFilter)}
                  >
                    {home.showMore}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
