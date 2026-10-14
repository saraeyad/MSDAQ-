import { HomeBbcFrontpage } from "@/features/public-site/home/HomeBbcFrontpage";
import { HomeBandMoreLink } from "@/features/public-site/home/HomeBandMoreLink";
import { HomeFilterBoard } from "@/features/public-site/home/HomeFilterBoard";
import { HomeHero } from "@/features/public-site/home/HomeHero";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { useLocale, usePublicCopy } from "@/context/locale";
import { useSiteOrigin } from "@/context/site-origin";
import { siteLogoUrl } from "@/lib/seo/site-url";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { usePublicCategories } from "@/hooks/public";
import {
  getDeskLayout,
  splitFrontPack,
  frontPackArticleIds,
  partitionFrontStack,
} from "@/features/public-site/home/home-feed-layout";
import { cn } from "@/lib/utils";
import { Articles_APIs } from "@/services/api/articles";
import { PublicCategories_APIs } from "@/services/api/public-categories";
import type { PublicArticle } from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState, useSyncExternalStore } from "react";
import { categoryPath } from "@/router/routes";

const MOBILE_CARD_LIMIT = 10;
const ALL_FEED_LIMIT = 24;
const ALL_FEED_MOBILE = 16;
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

function uniqueArticles(groups: PublicArticle[][]): PublicArticle[] {
  const seen = new Set<string>();
  const items: PublicArticle[] = [];
  for (const group of groups) {
    for (const article of group) {
      const id = String(article.id);
      if (seen.has(id)) continue;
      seen.add(id);
      items.push(article);
    }
  }
  return items;
}

function byPublishedAt(a: PublicArticle, b: PublicArticle) {
  return (
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

function HomeFeedSkeleton() {
  return (
    <div className="home-feed-skeleton" aria-hidden>
      <div className="home-bbc-frontpage home-bbc-frontpage--skeleton">
        <div className="home-feed-skeleton__stack-row" />
        <div className="home-feed-skeleton__lead" />
        <div className="home-feed-skeleton__stack-row" />
      </div>
      <div className="home-feed-skeleton__grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="home-feed-skeleton__card" />
        ))}
      </div>
    </div>
  );
}

function HomeFilterSkeleton() {
  return (
    <div className="home-feed-skeleton home-feed-skeleton--desks" aria-hidden>
      <div className="home-feed-skeleton__grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="home-feed-skeleton__card" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [expandedMobile, setExpandedMobile] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const isDesktop = useSyncExternalStore(
    subscribeDesktopCards,
    desktopCardsSnapshot,
    () => false,
  );
  const { data: categories = [] } = usePublicCategories();
  const copy = usePublicCopy();
  const { brand, home } = copy;
  const { locale } = useLocale();
  const origin = useSiteOrigin();
  const homeHead = {
    title: brand.name,
    canonical: origin,
    ogType: "website",
    ogImage: siteLogoUrl(origin),
  };

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

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ["home-articles", locale],
    queryFn: () => Articles_APIs.list({ latest: true, lang: locale }),
  });

  const deskQueries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["home-desk", locale, category.slug],
      queryFn: () => PublicCategories_APIs.getBySlug(category.slug, 1, locale),
      enabled: categories.length > 0,
    })),
  });

  const articles = latestData?.items ?? [];
  const isFrontLoading = latestLoading;

  const frontPackSource = useMemo(() => {
    if (isDesktop || expandedMobile) return articles;
    return articles.slice(0, MOBILE_CARD_LIMIT);
  }, [articles, isDesktop, expandedMobile]);

  const frontPack = useMemo(
    () => splitFrontPack(frontPackSource),
    [frontPackSource],
  );

  const frontPackIds = useMemo(
    () => frontPackArticleIds(frontPack),
    [frontPack],
  );

  const frontPromoArticles = useMemo(() => {
    if (frontPack.stack.length === 0) return [];
    return partitionFrontStack(frontPack.stack).promos;
  }, [frontPack.stack]);

  const activeDeskIndex = categories.findIndex(
    (category) => category.slug === activeFilter,
  );
  const activeDeskQuery =
    activeFilter === "all" ? undefined : deskQueries[activeDeskIndex];
  const activeLayout =
    activeFilter === "all"
      ? "grid"
      : getDeskLayout(activeFilter, categories);

  const filteredArticles = useMemo(() => {
    if (activeFilter === "all") {
      return uniqueArticles([
        articles,
        ...deskQueries.map((query) => query.data?.articles ?? []),
      ])
        .filter((article) => !frontPackIds.has(String(article.id)))
        .sort(byPublishedAt);
    }
    return activeDeskQuery?.data?.articles ?? [];
  }, [activeFilter, articles, deskQueries, frontPackIds, activeDeskQuery]);

  const olderPromoPool = useMemo(() => {
    return [...filteredArticles].sort(
      (a, b) =>
        new Date(a.published_at).getTime() - new Date(b.published_at).getTime(),
    );
  }, [filteredArticles]);

  const isFilterLoading =
    activeFilter !== "all" &&
    Boolean(activeDeskQuery?.isPending) &&
    filteredArticles.length === 0;

  const feedLimit =
    isDesktop || expandedFilter
      ? ALL_FEED_LIMIT
      : ALL_FEED_MOBILE;
  const visibleArticles =
    activeFilter === "all"
      ? filteredArticles.slice(0, feedLimit)
      : filteredArticles;
  const canShowMoreFront =
    !isDesktop && !expandedMobile && articles.length > MOBILE_CARD_LIMIT;
  const canShowMoreFilter =
    activeFilter === "all" &&
    !isDesktop &&
    !expandedFilter &&
    filteredArticles.length > ALL_FEED_MOBILE;

  const hasFrontPack = Boolean(frontPack.lead) || frontPack.stack.length > 0;
  const activeLabel =
    filters.find((filter) => filter.id === activeFilter)?.label ?? activeFilter;
  const desksLoading =
    categories.length > 0 && deskQueries.some((query) => query.isPending);

  return (
    <div>
      <PublicPageHead head={homeHead} />
      <HomeHero />

      <section className="home-news-rail" aria-label={home.nowLabel}>
        <div className="container-page">
          {latestLoading ? (
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

      <section className="home-latest relative overflow-hidden py-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 news-section-bg" />

        <div className="container-page relative">
          <div>
            {isFrontLoading ? (
              <HomeFeedSkeleton />
            ) : articles.length === 0 ? null : (
              <>
                <div className="home-feed home-news-board">
                  {hasFrontPack ? (
                    <HomeBbcFrontpage frontPack={frontPack} />
                  ) : null}

                  {filters.length > 1 ? (
                    <nav
                      className="home-latest-filters home-latest-filters--split"
                      aria-label={home.latestTitle}
                    >
                      {filters.map((filter) => {
                        const active = activeFilter === filter.id;
                        return (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => {
                              setActiveFilter(filter.id);
                              setExpandedFilter(false);
                            }}
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
                  ) : null}

                  {isFilterLoading ||
                  (activeFilter === "all" && desksLoading && visibleArticles.length === 0) ? (
                    <HomeFilterSkeleton />
                  ) : visibleArticles.length === 0 ? (
                    <p className="home-filter-empty">
                      {activeFilter === "all"
                        ? home.noFilterMatch
                        : home.filterEmpty(activeLabel)}
                    </p>
                  ) : (
                    <div
                      key={activeFilter}
                      className={cn(
                        "home-filter-stage",
                        activeLayout === "audio" && "home-filter-stage--audio",
                      )}
                    >
                      <HomeFilterBoard
                        articles={visibleArticles}
                        layout={activeLayout}
                        frontPromos={
                          activeFilter === "all" ? frontPromoArticles : []
                        }
                        olderPromoPool={olderPromoPool}
                      />
                      {activeFilter !== "all" ? (
                        <HomeBandMoreLink
                          to={categoryPath(activeFilter)}
                          label={home.moreInSection(activeLabel)}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
                {canShowMoreFront ? (
                  <button
                    type="button"
                    className="home-latest-more"
                    onClick={() => setExpandedMobile(true)}
                  >
                    {home.showMore}
                  </button>
                ) : null}
                {canShowMoreFilter ? (
                  <button
                    type="button"
                    className="home-latest-more"
                    onClick={() => setExpandedFilter(true)}
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
