import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import type { HomeFeedDeskLayout } from "@/features/public-site/home/home-feed-layout";
import { useLocale, usePublicCopy } from "@/context/locale";
import type { PublicArticle } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAIR_VISUAL = 4;
const PAIR_TEXT = 4;
const SLIDE_SIZE = PAIR_VISUAL + PAIR_TEXT;
const PROMO_ROW_SIZE = 5;

function HomePromoRow({
  articles,
  indexOffset,
}: {
  articles: PublicArticle[];
  indexOffset: number;
}) {
  if (articles.length === 0) return null;

  return (
    <div className="home-bbc-promo-row home-strip home-filter-board__promo-row">
      {articles.map((article, index) => (
        <HomeArticleCard
          key={article.id}
          article={article}
          index={indexOffset + index}
          variant="editorialSide"
          className="home-editorial--promo"
        />
      ))}
    </div>
  );
}

function promosForSlide(
  slideIndex: number,
  slides: PublicArticle[][],
  frontPromos: PublicArticle[],
  olderPool: PublicArticle[],
): PublicArticle[] {
  if (slideIndex === 0 && frontPromos.length > 0) {
    return frontPromos.slice(0, PROMO_ROW_SIZE);
  }

  const usedIds = new Set(slides.flat().map((article) => String(article.id)));
  const pool = olderPool.filter((article) => !usedIds.has(String(article.id)));
  const promoSlideIndex =
    frontPromos.length > 0 ? slideIndex - 1 : slideIndex;
  if (promoSlideIndex < 0) return [];

  return pool.slice(
    promoSlideIndex * PROMO_ROW_SIZE,
    promoSlideIndex * PROMO_ROW_SIZE + PROMO_ROW_SIZE,
  );
}

function splitBoard(articles: PublicArticle[]) {
  if (articles.length <= 2) {
    return {
      visual: articles,
      text: [] as PublicArticle[],
    };
  }
  return {
    visual: articles.slice(0, PAIR_VISUAL),
    text: articles.slice(PAIR_VISUAL, PAIR_VISUAL + PAIR_TEXT),
  };
}

function chunkSlides(articles: PublicArticle[]) {
  const slides: PublicArticle[][] = [];
  for (let i = 0; i < articles.length; i += SLIDE_SIZE) {
    slides.push(articles.slice(i, i + SLIDE_SIZE));
  }
  return slides;
}

function FilterPairSlide({
  articles,
  slideOffset,
}: {
  articles: PublicArticle[];
  slideOffset: number;
}) {
  const { visual, text } = splitBoard(articles);
  const showPair = text.length > 0;

  if (!showPair) {
    return (
      <div className="home-bbc-card-grid home-bbc-card-grid--duo">
        {visual.map((article, index) => (
          <HomeArticleCard
            key={article.id}
            article={article}
            index={slideOffset + index}
            variant="editorialSide"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="home-feed-pair">
      <div className="home-feed-pair__col home-feed-pair__col--visual">
        <div className="home-bbc-card-grid home-bbc-card-grid--duo home-filter-board__visual">
          {visual.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={slideOffset + index}
              variant="editorialSide"
            />
          ))}
        </div>
      </div>
      <div className="home-feed-pair__col home-feed-pair__col--rail">
        <div className="home-bbc-rail-list">
          {text.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={slideOffset + visual.length + index}
              variant="editorialText"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeFilterBoard({
  articles,
  layout,
  frontPromos = [],
  olderPromoPool = [],
}: {
  articles: PublicArticle[];
  layout: HomeFeedDeskLayout;
  /** Former BBC front promo band — not shown in the headline pair. */
  frontPromos?: PublicArticle[];
  /** Oldest-first pool for promo rows on later slides. */
  olderPromoPool?: PublicArticle[];
}) {
  const { dir } = useLocale();
  const { article, home } = usePublicCopy();
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => chunkSlides(articles), [articles]);
  const slideCount = slides.length;

  useEffect(() => {
    setIndex((current) =>
      slideCount === 0 ? 0 : Math.min(current, slideCount - 1),
    );
  }, [slideCount]);

  const goTo = useCallback(
    (next: number) => {
      if (slideCount <= 1) return;
      setIndex((next + slideCount) % slideCount);
    },
    [slideCount],
  );

  if (layout === "audio") {
    return (
      <div className="home-filter-audio">
        {articles.slice(0, 8).map((item, itemIndex) => (
          <HomeArticleCard
            key={item.id}
            article={item}
            index={itemIndex}
            variant="podcast"
          />
        ))}
      </div>
    );
  }

  if (layout === "wide" || layout === "video") {
    return (
      <div className="home-bbc-card-grid home-bbc-card-grid--duo">
        {articles.slice(0, 8).map((item, itemIndex) => (
          <HomeArticleCard
            key={item.id}
            article={item}
            index={itemIndex}
            variant="editorialSide"
          />
        ))}
      </div>
    );
  }

  if (slideCount === 0) return null;

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const offset = dir === "rtl" ? index * 100 : -index * 100;
  const showNav = slideCount > 1;

  return (
    <div className="home-filter-board">
      <div
        className="home-filter-board__slider"
        aria-roledescription="carousel"
        aria-label={home.latestTitle}
      >
        <div className="home-filter-board__viewport">
          <div
            className="home-filter-board__track"
            style={{ transform: `translate3d(${offset}%, 0, 0)` }}
          >
            {slides.map((slide, slideIndex) => (
              <div
                key={slide.map((item) => item.id).join("-") || slideIndex}
                className="home-filter-board__slide"
                aria-hidden={slideIndex !== index}
                inert={slideIndex !== index ? true : undefined}
              >
                <FilterPairSlide
                  articles={slide}
                  slideOffset={slideIndex * SLIDE_SIZE}
                />
              </div>
            ))}
          </div>
        </div>

        {showNav ? (
          <>
            <button
              type="button"
              className="home-filter-board__nav home-filter-board__nav--prev"
              aria-label={article.prevStory}
              onClick={() => goTo(index - 1)}
            >
              <PrevIcon className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className="home-filter-board__nav home-filter-board__nav--next"
              aria-label={article.nextStory}
              onClick={() => goTo(index + 1)}
            >
              <NextIcon className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      <HomePromoRow
        articles={promosForSlide(index, slides, frontPromos, olderPromoPool)}
        indexOffset={index * SLIDE_SIZE + SLIDE_SIZE}
      />
    </div>
  );
}
