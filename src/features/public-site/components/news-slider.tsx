import { PublicArticleCover } from "@/components/article/cover-image";
import {
  isEnglishArticlePending,
  PublicArticleEnglishPendingBadge,
} from "@/features/public-site/components/PublicArticleEnglishPending";
import { useLocale, usePublicCopy } from "@/context/locale";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { publicMediaTypeLabelFromCopy } from "@/lib/i18n/public-media-labels";
import { cn } from "@/lib/utils";
import { articlePath } from "@/router/routes";
import type { PublicArticle } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface NewsSliderProps {
  articles: PublicArticle[];
  className?: string;
  autoPlayMs?: number;
  variant?: "default" | "banner" | "rail";
  fullWidth?: boolean;
}

export function NewsSlider({
  articles,
  className,
  autoPlayMs = 6000,
  variant = "default",
  fullWidth = false,
}: NewsSliderProps) {
  const slides = articles.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { locale, dir } = useLocale();
  const copy = usePublicCopy();
  const { home, article } = copy;

  const isRail = variant === "rail";
  const isBanner = variant === "banner";
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (isRail) return;
    if (slides.length <= 1 || paused || autoPlayMs <= 0) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    const timer = window.setInterval(() => goTo(index + 1), autoPlayMs);
    return () => window.clearInterval(timer);
  }, [autoPlayMs, goTo, index, isRail, paused, slides.length]);

  const slideHeight = isBanner
    ? "h-[12rem] sm:h-[16rem] md:h-[20rem] lg:h-[24rem]"
    : "aspect-video";

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          isRail ? "news-rail news-rail--empty" : slideHeight,
          !fullWidth && !isRail && "rounded-xl bg-muted",
          className,
        )}
      >
        {home.noArticles}
      </div>
    );
  }

  if (isRail) {
    const repeats = slides.length >= 4 ? 2 : 4;
    const tickerItems = Array.from({ length: repeats }, () => slides).flat();
    const durationSec = Math.max(22, slides.length * 8);

    return (
      <div
        className={cn(
          "news-rail",
          slides.length > 1 && "news-rail--moving",
          paused && "news-rail--paused",
          className,
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <span className="news-rail__live">
          <span className="news-rail__live-dot" aria-hidden />
          {home.nowLabel}
        </span>

        <div className="news-rail__viewport">
          <div
            className="news-rail__track"
            style={{ animationDuration: `${durationSec}s` }}
          >
            {tickerItems.map((item, itemIndex) => {
              const itemCategory =
                (item.category
                  ? localizedCategoryName(item.category, locale)
                  : null) ??
                publicMediaTypeLabelFromCopy(copy, item.media_type);
              const itemPending = isEnglishArticlePending(item, locale);

              return (
                <Link
                  key={`${item.id}-${itemIndex}`}
                  to={articlePath(item.id)}
                  className="news-rail__story"
                >
                  <span className="news-rail__meta">{itemCategory}</span>
                  <span className="news-rail__title">
                    {itemPending ? (
                      <PublicArticleEnglishPendingBadge />
                    ) : (
                      item.title
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const current = slides[index];
  const category =
    (current.category
      ? localizedCategoryName(current.category, locale)
      : null) ??
    publicMediaTypeLabelFromCopy(copy, current.media_type);
  const englishPending = isEnglishArticlePending(current, locale);

  return (
    <div
      className={cn(
        "news-slider group relative w-full overflow-hidden",
        isBanner && "news-slider--banner",
        fullWidth && "news-slider--full-bleed",
        !fullWidth && "rounded-xl border-2 border-border",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        to={articlePath(current.id)}
        className={cn("relative block w-full", slideHeight)}
      >
        <PublicArticleCover
          article={current}
          priority
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <span className="news-slider__category inline-block rounded-md px-3 py-1 text-xs font-semibold">
            {category}
          </span>
          <h2 className="mt-3 max-w-3xl font-headline text-xl font-bold leading-snug text-white md:text-3xl">
            {englishPending ? (
              <PublicArticleEnglishPendingBadge className="border-white/30 bg-white/10 text-white" />
            ) : (
              current.title
            )}
          </h2>
          {!englishPending && current.description && (
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/90 md:text-base">
              {current.description}
            </p>
          )}
        </div>
      </Link>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label={article.prevStory}
            onClick={() => goTo(index - 1)}
            className="absolute start-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
          >
            <PrevIcon className="size-5" />
          </button>
          <button
            type="button"
            aria-label={article.nextStory}
            onClick={() => goTo(index + 1)}
            className="absolute end-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
          >
            <NextIcon className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
