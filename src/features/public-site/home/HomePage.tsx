import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import { HomeCategoryDesk as HomeCategoryDeskSection } from "@/features/public-site/home/HomeCategoryDesk";
import { HomeHero } from "@/features/public-site/home/HomeHero";
import { PublicPageHead } from "@/components/seo/PublicPageHead";
import { useLocale, usePublicCopy } from "@/context/locale";
import { useSiteOrigin } from "@/context/site-origin";
import { siteLogoUrl } from "@/lib/seo/site-url";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { usePublicCategories } from "@/hooks/public";
import {
  buildParentSlugMap,
  findCategoryByFilterKey,
} from "@/lib/publishing";
import {
  buildHomeMosaic,
  deskArticleLimit,
  getDeskLayout,
  isAudioCategoryBand,
  isHumanStoriesCategoryBand,
  findPhotoReportsCategory,
  isStudiesCategoryBand,
  orderCategoriesForDesks,
  splitFrontPack,
  type HomeCategoryDesk,
} from "@/features/public-site/home/home-feed-layout";
import { cn } from "@/lib/utils";
import { Articles_APIs } from "@/services/api/articles";
import { PublicCategories_APIs } from "@/services/api/public-categories";
import type { PublicArticle } from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { categoryPath } from "@/router/routes";

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
  const articleSlug = article.category?.slug?.trim();
  if (articleSlug) {
    const allowedSlugs = slugSets.get(filterId);
    if (allowedSlugs?.has(articleSlug) || articleSlug === filterId) {
      return true;
    }
  }
  return false;
}

function HomeFeedSkeleton() {
  return (
    <div className="home-feed-skeleton" aria-hidden>
      <div className="home-feed-frontpage">
        <div className="home-feed-skeleton__lead" />
        <div className="home-feed-skeleton__stack">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="home-feed-skeleton__stack-row" />
          ))}
        </div>
      </div>
      <div className="home-feed-skeleton__grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="home-feed-skeleton__card" />
        ))}
      </div>
    </div>
  );
}

function HomeDeskSkeleton() {
  return (
    <div className="home-feed-skeleton home-feed-skeleton--desks" aria-hidden>
      <div className="home-feed-skeleton__band-title" />
      <div className="home-feed-skeleton__grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="home-feed-skeleton__card" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [expandedMobile, setExpandedMobile] = useState(false);
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

  const parentSlugMap = useMemo(
    () => buildParentSlugMap(categories),
    [categories],
  );

  const orderedCategories = useMemo(
    () => orderCategoriesForDesks(categories),
    [categories],
  );

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ["home-articles", locale],
    queryFn: () => Articles_APIs.list({ latest: true, lang: locale }),
  });

  const deskQueries = useQueries({
    queries: orderedCategories.map((category) => ({
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

  const desks = useMemo((): HomeCategoryDesk[] => {
    return orderedCategories
      .map((category, index) => {
        const feedArticles = deskQueries[index]?.data?.articles ?? [];
        const layout = getDeskLayout(category.slug, categories);
        const deskArticles = feedArticles.slice(
          0,
          deskArticleLimit(layout),
        );
        if (deskArticles.length === 0) return null;
        return {
          slug: category.slug,
          articles: deskArticles,
          layout,
        };
      })
      .filter((desk): desk is HomeCategoryDesk => desk !== null);
  }, [categories, orderedCategories, deskQueries]);

  const mosaic = useMemo(() => {
    const built = buildHomeMosaic(desks, categories);

    const fillDesk = (
      current: HomeCategoryDesk | null,
      slugs: Array<string | undefined>,
    ): HomeCategoryDesk | null => {
      const titleSlug = slugs.find(Boolean) ?? current?.slug;
      if (!titleSlug) return current;
      const have = new Set(
        (current?.articles ?? []).map((item) => String(item.id)),
      );
      const extra: PublicArticle[] = [];
      for (const slug of slugs) {
        if (!slug) continue;
        for (const article of articles) {
          const id = String(article.id);
          if (have.has(id)) continue;
          if (!matchesFilter(article, slug, parentSlugMap)) continue;
          have.add(id);
          extra.push(article);
        }
      }
      const articlesForDesk = [...(current?.articles ?? []), ...extra].slice(
        0,
        3,
      );
      if (articlesForDesk.length === 0) return current;
      return { slug: titleSlug, articles: articlesForDesk, layout: "grid" };
    };

    const looksLikePhotoReports = (label: string) =>
      label.includes("تقارير") &&
      label.includes("مصور") &&
      !label.includes("قصص");

    const photoReportsSlug =
      findPhotoReportsCategory(categories)?.slug ??
      orderedCategories.find((category, index) => {
        const apiCategory = deskQueries[index]?.data?.category;
        const label = `${apiCategory?.name_ar ?? ""} ${category.name_ar ?? ""} ${localizedCategoryName(category, locale)}`;
        return looksLikePhotoReports(label);
      })?.slug;

    const photoReportsFromApi =
      orderedCategories.findIndex((category) => category.slug === photoReportsSlug);

    const humanSlug = categories.find((category) =>
      isHumanStoriesCategoryBand(category.slug, categories),
    )?.slug;

    return {
      ...built,
      human: fillDesk(built.human, [humanSlug]),
      visual: fillDesk(
        photoReportsSlug
          ? {
              slug: photoReportsSlug,
              articles:
                desks.find((desk) => desk.slug === photoReportsSlug)
                  ?.articles ??
                deskQueries[photoReportsFromApi]?.data?.articles ??
                [],
              layout: "grid",
            }
          : null,
        [photoReportsSlug],
      ),
    };
  }, [
    desks,
    categories,
    articles,
    parentSlugMap,
    orderedCategories,
    deskQueries,
    locale,
  ]);

  const podcastMoreHref = useMemo(() => {
    const slug =
      mosaic?.podcastSlug ??
      categories.find((category) => isAudioCategoryBand(category.slug, categories))
        ?.slug;
    return slug ? categoryPath(slug) : null;
  }, [mosaic?.podcastSlug, categories]);

  const desksLoading =
    categories.length > 0 && deskQueries.some((query) => query.isPending);

  const canShowMore =
    !isDesktop && !expandedMobile && articles.length > MOBILE_CARD_LIMIT;

  function categoryDeskTitle(slug: string): string {
    const category = findCategoryByFilterKey(categories, slug);
    if (category) {
      return localizedCategoryName(category, locale);
    }
    return slug;
  }

  const podcastTitle = mosaic?.podcastSlug
    ? categoryDeskTitle(mosaic.podcastSlug)
    : home.podcastsTitle;

  const hasFrontPack = Boolean(frontPack.lead) || frontPack.stack.length > 0;

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

          <div className="mt-6">
            {isFrontLoading ? (
              <HomeFeedSkeleton />
            ) : articles.length === 0 ? null : (
              <>
                <div className="home-feed">
                  {hasFrontPack ? (
                    <div
                      className={cn(
                        "home-feed-frontpage",
                        frontPack.stack.length === 0 &&
                          "home-feed-frontpage--lead-only",
                      )}
                    >
                      {frontPack.lead ? (
                        <div className="home-feed-frontpage__lead">
                          <HomeArticleCard
                            article={frontPack.lead}
                            index={0}
                            featured
                          />
                        </div>
                      ) : null}
                      {frontPack.stack.length > 0 ? (
                        <div className="home-feed-frontpage__stack">
                          {frontPack.stack.map((article, index) => (
                            <HomeArticleCard
                              key={article.id}
                              article={article}
                              index={index + 1}
                              variant="compact"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {desksLoading ? (
                      <HomeDeskSkeleton />
                    ) : mosaic ? (
                      <>
                        {mosaic.podcasts.length > 0 ? (
                          <section
                            className="home-feed-band home-feed-band--podcasts"
                            aria-label={podcastTitle}
                          >
                            <div className="home-feed-band__header">
                              <h3 className="home-feed-band__title">
                                {podcastTitle}
                              </h3>
                              {podcastMoreHref ? (
                                <Link
                                  className="home-feed-band__more"
                                  to={podcastMoreHref}
                                >
                                  {home.morePodcasts}
                                </Link>
                              ) : null}
                            </div>
                            <div className="home-feed-podcasts">
                              {mosaic.podcasts.map((article, index) => (
                                <HomeArticleCard
                                  key={article.id}
                                  article={article}
                                  index={4 + index}
                                  variant="podcast"
                                />
                              ))}
                            </div>
                          </section>
                        ) : null}
                        {mosaic.human ? (
                          <HomeCategoryDeskSection
                            desk={mosaic.human}
                            title={categoryDeskTitle(mosaic.human.slug)}
                            moreLabel={home.moreInSection(
                              categoryDeskTitle(mosaic.human.slug),
                            )}
                            cardIndexOffset={7}
                          />
                        ) : null}
                        {mosaic.visual || mosaic.aside ? (
                          <div
                            className={cn(
                              "home-feed-pair",
                              !mosaic.aside && "home-feed-pair--single",
                              !mosaic.visual && "home-feed-pair--single",
                            )}
                          >
                            {mosaic.visual ? (
                              <div className="home-feed-pair__col">
                                <div className="home-feed-band__header">
                                  <h3 className="home-feed-band__title">
                                    {locale === "ar"
                                      ? "تقارير مصورة"
                                      : "Photo reports"}
                                  </h3>
                                  <Link
                                    className="home-feed-band__more"
                                    to={categoryPath(mosaic.visual.slug)}
                                  >
                                    {home.moreInSection(
                                      locale === "ar"
                                        ? "تقارير مصورة"
                                        : "Photo reports",
                                    )}
                                  </Link>
                                </div>
                                <div className="home-feed-frontpage__stack">
                                  {mosaic.visual.articles.map((article, index) => (
                                    <HomeArticleCard
                                      key={article.id}
                                      article={article}
                                      index={9 + index}
                                      variant="compact"
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : null}
                            {mosaic.aside ? (
                              <div className="home-feed-pair__col">
                                <div className="home-feed-band__header">
                                  <h3 className="home-feed-band__title">
                                    {[
                                      mosaic.asideSuccessSlug
                                        ? categoryDeskTitle(
                                            mosaic.asideSuccessSlug,
                                          )
                                        : null,
                                      mosaic.asideStudiesSlug
                                        ? categoryDeskTitle(
                                            mosaic.asideStudiesSlug,
                                          )
                                        : null,
                                    ]
                                      .filter(Boolean)
                                      .join(" / ")}
                                  </h3>
                                </div>
                                <div className="home-feed-frontpage__stack">
                                  {mosaic.aside.articles.map((article, index) => {
                                    const articleSlug =
                                      article.category?.slug?.trim() ?? "";
                                    const moreSlug =
                                      articleSlug &&
                                      isStudiesCategoryBand(
                                        articleSlug,
                                        categories,
                                      )
                                        ? mosaic.asideStudiesSlug
                                        : mosaic.asideSuccessSlug ??
                                          mosaic.asideStudiesSlug;
                                    const moreTitle = moreSlug
                                      ? categoryDeskTitle(moreSlug)
                                      : "";
                                    return (
                                      <HomeArticleCard
                                        key={article.id}
                                        article={article}
                                        index={12 + index}
                                        variant="compact"
                                        moreHref={
                                          moreSlug
                                            ? categoryPath(moreSlug)
                                            : null
                                        }
                                        moreLabel={
                                          moreTitle
                                            ? home.moreInSection(moreTitle)
                                            : undefined
                                        }
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                </div>
                {canShowMore ? (
                  <button
                    type="button"
                    className="home-latest-more"
                    onClick={() => setExpandedMobile(true)}
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
