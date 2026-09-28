import { PublicArticleCover } from "@/components/article/cover-image";
import { ArticleVerifiedBadge } from "@/components/article/article-verified-badge";
import {
  isEnglishArticlePending,
  PublicArticleEnglishPendingBadge,
} from "@/features/public-site/components/PublicArticleEnglishPending";
import { ArticleTranslateButton } from "@/features/public-site/article-page/ArticleTranslateButton";
import { useLocale, usePublicCopy } from "@/context/locale";
import { localizedCategoryName } from "@/lib/i18n/localized-category";
import { publicMediaTypeLabelFromCopy } from "@/lib/i18n/public-media-labels";
import { publicArticleCoverUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { articlePath } from "@/router/routes";
import type { PublicArticle, PublicMediaType } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Mic,
  Play,
  Video,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";

const PublicArticleVideoPlayer = lazy(() =>
  import("@/features/public-site/components/PublicArticleVideoPlayer").then(
    (module) => ({ default: module.PublicArticleVideoPlayer }),
  ),
);

const MEDIA_ICONS: Record<PublicMediaType, typeof FileText> = {
  text: FileText,
  audio: Mic,
  video: Video,
};

type HomeArticleCardVariant =
  | "default"
  | "compact"
  | "audioRow"
  | "podcast"
  | "lead"
  | "editorialHero"
  | "editorialSide"
  | "editorialText";

/** Lead + body split for the home hero card excerpt. */
function splitHeroExcerpt(description: string): {
  lead: string;
  body: string;
} | null {
  const text = description.replace(/\s+/g, " ").trim();
  if (text.length < 40) return null;

  const sentenceMatch = text.match(/^(.+?[.!?؟…])(?:\s+)([\s\S]+)$/);
  if (sentenceMatch?.[1] && sentenceMatch[2]?.trim().length >= 18) {
    return { lead: sentenceMatch[1].trim(), body: sentenceMatch[2].trim() };
  }

  const commaIdx = text.indexOf("،");
  if (commaIdx >= 24 && commaIdx <= text.length - 22) {
    return {
      lead: text.slice(0, commaIdx + 1).trim(),
      body: text.slice(commaIdx + 1).trim(),
    };
  }

  return null;
}

function cardEdgeShift(id: PublicArticle["id"], index: number) {
  const seed = [...String(id)].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    index * 13,
  );
  const start = 0.15 + (seed % 7) * 0.22;
  const end = 0.15 + ((seed * 5) % 6) * 0.22;
  return {
    marginInlineStart: `${start.toFixed(2)}rem`,
    marginInlineEnd: `${end.toFixed(2)}rem`,
  };
}

interface HomeArticleCardProps {
  article: PublicArticle;
  featured?: boolean;
  wide?: boolean;
  variant?: HomeArticleCardVariant;
  index?: number;
  className?: string;
  moreHref?: string | null;
  moreLabel?: string;
}

export function HomeArticleCard({
  article,
  featured = false,
  wide = false,
  variant = "default",
  index = 0,
  className,
  moreHref,
  moreLabel,
}: HomeArticleCardProps) {
  const [mediaStarted, setMediaStarted] = useState(false);
  const { locale, dir } = useLocale();
  const CtaArrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const copy = usePublicCopy();
  const { common, article: articleCopy } = copy;
  const dateLocale = locale === "ar" ? "ar" : "en-GB";
  const Icon = MEDIA_ICONS[article.media_type] ?? FileText;
  const badge =
    (article.category
      ? localizedCategoryName(article.category, locale)
      : null) ?? publicMediaTypeLabelFromCopy(copy, article.media_type);
  const englishPending = isEnglishArticlePending(article, locale);
  const isAudio = article.media_type === "audio";
  const isVideo = article.media_type === "video";
  const articleHref = articlePath(article.id);
  const posterUrl = publicArticleCoverUrl(article);
  const edgeShift = cardEdgeShift(article.id, index);

  if (variant === "lead") {
    return (
      <article
        style={{ animationDelay: `${index * 60}ms` }}
        className={cn(
          "home-article-card home-article-card--lead news-card-enter group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/25 lg:flex-row lg:items-stretch",
          className,
        )}
      >
        <div className="home-article-card__media w-full shrink-0 lg:w-[44%]">
          <div className="home-article-card__media-frame">
            {isVideo && mediaStarted ? (
              <Suspense
                fallback={
                  <PublicArticleCover
                    article={article}
                    priority
                    className="home-card-cover--fit"
                  />
                }
              >
                <PublicArticleVideoPlayer
                  articleId={article.id}
                  title={article.title}
                  posterUrl={posterUrl}
                  coverImage={article.cover_image}
                  fill
                  startOnMount
                  className="size-full"
                />
              </Suspense>
            ) : isVideo ? (
              <button
                type="button"
                className="article-media-poster home-article-card__media-link"
                onClick={() => setMediaStarted(true)}
                aria-label={articleCopy.playVideo(
                  englishPending
                    ? articleCopy.englishPendingTitle
                    : article.title,
                )}
              >
                <PublicArticleCover
                  article={article}
                  priority
                  className="home-card-cover--fit article-media-poster__image"
                />
                <span className="article-media-poster__scrim" aria-hidden />
                <span className="article-media-poster__play" aria-hidden>
                  <Play className="size-7 fill-current" />
                </span>
              </button>
            ) : (
              <Link to={articleHref} className="home-article-card__media-link">
                <PublicArticleCover
                  article={article}
                  priority
                  className="home-card-cover--fit"
                />
              </Link>
            )}
            <span
              className="home-article-card__media-type pointer-events-none"
              aria-hidden
            >
              <Icon className="size-4" />
            </span>
          </div>
          <span className="home-article-card__category">{badge}</span>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col p-5 lg:p-6">
          <div className="absolute start-0 top-0 hidden h-full w-1 rounded-full bg-primary lg:block" />

          <Link to={articleHref} className="block">
            <h3 className="font-headline text-xl font-bold leading-snug transition-colors group-hover:text-primary md:text-2xl">
              {englishPending ? (
                <PublicArticleEnglishPendingBadge />
              ) : (
                <span className="inline-flex flex-wrap items-center gap-2">
                  {article.title}
                  <ArticleVerifiedBadge article={article} />
                </span>
              )}
            </h3>

            {!englishPending && article.description ? (
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {article.description}
              </p>
            ) : null}
          </Link>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4">
            <time className="text-xs text-muted-foreground">
              {new Date(article.published_at).toLocaleDateString(dateLocale)}
            </time>
            <div className="flex items-center gap-2">
              <ArticleTranslateButton
                articleId={article.id}
                contentLang={locale}
                compact
              />
              <Link
                to={articleHref}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                {common.readMore}
                <CtaArrow className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article
        style={{ animationDelay: `${index * 40}ms`, ...edgeShift }}
        className={cn("home-feed-stack-item news-card-enter group", className)}
      >
        <div className="home-feed-stack-item__link">
          <span className="home-feed-stack-item__body">
            {moreHref && moreLabel ? (
              <Link to={moreHref} className="home-feed-stack-item__more">
                {moreLabel}
                <CtaArrow className="size-3.5" />
              </Link>
            ) : null}
            <Link to={articleHref} className="home-feed-stack-item__title">
              {englishPending ? (
                <PublicArticleEnglishPendingBadge />
              ) : (
                <>
                  <span className="home-feed-stack-item__headline">
                    {article.title}
                  </span>
                  <ArticleVerifiedBadge article={article} compact />
                </>
              )}
            </Link>
            <time className="home-feed-stack-item__date">
              {new Date(article.published_at).toLocaleDateString(dateLocale)}
            </time>
          </span>
          <div className="home-feed-stack-item__visual">
            <Link to={articleHref} className="home-feed-stack-item__thumb-link">
              <span className="home-feed-stack-item__thumb">
                <PublicArticleCover
                  article={article}
                  className="home-card-cover--fit"
                />
                <span className="home-feed-stack-item__media" aria-hidden>
                  <Icon className="size-3.5" />
                </span>
              </span>
            </Link>
            <span className="home-feed-stack-item__category">{badge}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "podcast") {
    return (
      <article
        style={{ animationDelay: `${index * 40}ms` }}
        className={cn("home-podcast news-card-enter group", className)}
      >
        <Link to={articleHref} className="home-podcast__cover">
          <PublicArticleCover
            article={article}
            className="home-card-cover--fit"
          />
          <span className="home-podcast__wave-scrim" aria-hidden>
            <svg
              className="home-podcast__wave-svg"
              viewBox="0 0 320 28"
              preserveAspectRatio="none"
            >
              <path
                fill="currentColor"
                d="M0,14 C40,2 80,26 120,14 S200,2 240,14 280,26 320,14 V28 H0 Z"
              />
            </svg>
          </span>
        </Link>
        <div className="home-podcast__body">
          <div className="home-podcast__top">
            {moreHref && moreLabel ? (
              <Link to={moreHref} className="home-podcast__more">
                {moreLabel}
                <CtaArrow className="size-3.5" />
              </Link>
            ) : null}
          </div>
          <Link to={articleHref} className="home-podcast__title">
            {englishPending ? (
              <PublicArticleEnglishPendingBadge />
            ) : (
              <span className="inline-flex flex-wrap items-center gap-2">
                {article.title}
                <ArticleVerifiedBadge article={article} />
              </span>
            )}
          </Link>
          {!englishPending && article.description ? (
            <p className="home-podcast__deck">{article.description}</p>
          ) : null}
          <div className="home-podcast__foot">
            <p className="home-podcast__meta">
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString(dateLocale)}
              </time>
              <span className="home-podcast__meta-sep" aria-hidden>
                |
              </span>
              <span className="home-podcast__meta-category">{badge}</span>
            </p>
            <span className="home-podcast__play-cluster">
              <span className="home-podcast__waveform" aria-hidden>
                <span className="home-podcast__waveform-bar" />
                <span className="home-podcast__waveform-bar" />
                <span className="home-podcast__waveform-bar" />
                <span className="home-podcast__waveform-bar" />
                <span className="home-podcast__waveform-bar" />
              </span>
              <Link
                to={articleHref}
                className="home-card-listen home-card-listen--inline"
              >
                <Play className="size-4 fill-current" />
                {common.listenNow}
              </Link>
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (
    variant === "editorialHero" ||
    variant === "editorialSide" ||
    variant === "editorialText"
  ) {
    const isHero = variant === "editorialHero";
    const isText = variant === "editorialText";
    const publishedLabel = new Date(article.published_at).toLocaleDateString(
      dateLocale,
    );
    const heroExcerpt =
      isHero && article.description
        ? splitHeroExcerpt(article.description)
        : null;

    return (
      <article
        style={{ animationDelay: `${index * 50}ms` }}
        className={cn(
          "home-editorial news-card-enter group",
          isHero && "home-editorial--hero",
          variant === "editorialSide" && "home-editorial--side",
          isText && "home-editorial--text",
          className,
        )}
      >
        {!isText ? (
          <div className="home-editorial__media">
            <Link
              to={articleHref}
              className={cn(
                "home-editorial__media-frame",
                isHero
                  ? "home-editorial__media-frame--hero"
                  : "home-editorial__media-frame--side",
              )}
            >
              <PublicArticleCover
                article={article}
                priority={isHero || index === 0}
                className="home-card-cover--fit"
              />
            </Link>
            <span className="home-editorial__kicker">{badge}</span>
          </div>
        ) : null}

        <div className="home-editorial__body">
          {moreHref && moreLabel ? (
            <Link to={moreHref} className="home-editorial__section-more">
              {moreLabel}
            </Link>
          ) : null}

          <Link to={articleHref} className="home-editorial__title-link">
            <h3
              className={cn(
                "home-editorial__title",
                isHero && "home-editorial__title--hero",
              )}
            >
              {englishPending ? (
                <PublicArticleEnglishPendingBadge />
              ) : (
                <span className="home-editorial__title-text">
                  {article.title}
                </span>
              )}
            </h3>
          </Link>

          {!englishPending ? (
            <ArticleVerifiedBadge
              article={article}
              compact
              className="home-editorial__verified"
            />
          ) : null}

          {!englishPending && article.description ? (
            isHero && heroExcerpt ? (
              <div className="home-editorial__excerpt home-editorial__excerpt--hero">
                <p className="home-editorial__summary-lead">
                  {heroExcerpt.lead}
                </p>
                <p className="home-editorial__hero-copy">{heroExcerpt.body}</p>
              </div>
            ) : (
              <p
                className={cn(
                  "home-editorial__summary",
                  isHero ? "home-editorial__summary--hero-single" : "line-clamp-2",
                )}
              >
                {article.description}
              </p>
            )
          ) : null}

          <p className="home-editorial__meta">
            <time
              className="home-editorial__meta-date"
              dateTime={article.published_at}
            >
              {publishedLabel}
            </time>
            <span className="home-editorial__meta-sep" aria-hidden>
              |
            </span>
            <span className="home-editorial__meta-category">{badge}</span>
          </p>
        </div>
      </article>
    );
  }

  if (variant === "audioRow") {
    return (
      <article
        style={{ animationDelay: `${index * 40}ms`, ...edgeShift }}
        className={cn("home-feed-audio-row news-card-enter group", className)}
      >
        <div className="home-feed-audio-row__main">
          <Link to={articleHref} className="home-feed-audio-row__copy">
            <span className="home-feed-audio-row__badge">{badge}</span>
            <h3 className="home-feed-audio-row__title">
              {englishPending ? (
                <PublicArticleEnglishPendingBadge />
              ) : (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  {article.title}
                  <ArticleVerifiedBadge article={article} />
                </span>
              )}
            </h3>
            {!englishPending && article.description ? (
              <p className="home-feed-audio-row__summary">
                {article.description}
              </p>
            ) : null}
            <p className="home-feed-audio-row__meta">
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString(dateLocale)}
              </time>
              <span className="home-feed-audio-row__meta-sep" aria-hidden>
                |
              </span>
              <span className="home-feed-audio-row__meta-category">{badge}</span>
            </p>
          </Link>
          <div className="home-feed-audio-row__actions">
            <Link
              to={articleHref}
              className="home-card-listen home-card-listen--inline"
            >
              <Play className="size-4 fill-current" />
              {common.listenNow}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      style={{ animationDelay: `${index * 60}ms`, ...edgeShift }}
      className={cn(
        "news-card-enter group relative flex overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-primary/25",
        wide ? "flex-col lg:flex-row" : "flex-col",
        featured ? "min-h-[300px] lg:min-h-[320px]" : "min-h-[260px]",
        className,
      )}
    >
      <div
        className={cn(
          "home-card-media shrink-0",
          wide && "home-card-media--wide lg:w-2/5",
          featured && "home-card-media--featured",
        )}
      >
        <div
          className={cn(
            "home-card-media__frame",
            wide ? "home-card-media__frame--wide" : featured ? "home-card-media__frame--featured" : "home-card-media__frame--default",
          )}
        >
          {isVideo && mediaStarted ? (
            <Suspense
              fallback={
                <PublicArticleCover
                  article={article}
                  priority={featured || index === 0}
                  className="home-card-cover--fit"
                />
              }
            >
              <PublicArticleVideoPlayer
                articleId={article.id}
                title={article.title}
                posterUrl={posterUrl}
                coverImage={article.cover_image}
                fill
                startOnMount
                className="size-full"
              />
            </Suspense>
          ) : isVideo ? (
            <button
              type="button"
              className="article-media-poster home-card-media__link"
              onClick={() => setMediaStarted(true)}
              aria-label={articleCopy.playVideo(
                englishPending ? articleCopy.englishPendingTitle : article.title,
              )}
            >
              <PublicArticleCover
                article={article}
                priority={featured || index === 0}
                className="home-card-cover--fit article-media-poster__image"
              />
              <span className="article-media-poster__scrim" aria-hidden />
              <span className="article-media-poster__play" aria-hidden>
                <Play className="size-7 fill-current" />
              </span>
            </button>
          ) : (
            <Link to={articleHref} className="home-card-media__link">
              <PublicArticleCover
                article={article}
                priority={featured || index === 0}
                className="home-card-cover--fit"
              />
            </Link>
          )}
          <span className="home-card-media__type pointer-events-none" aria-hidden>
            <Icon className="size-4" />
          </span>
        </div>
        <span className="home-card-media__category">{badge}</span>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <div className="absolute start-0 top-0 h-0 w-1 rounded-full bg-primary transition-all duration-300 group-hover:h-full" />

        <Link to={articleHref} className="block">
          <h3
            className={cn(
              "font-headline font-bold leading-snug transition-colors group-hover:text-primary",
              featured ? "text-xl md:text-2xl" : "text-base md:text-lg",
            )}
          >
            {englishPending ? (
              <PublicArticleEnglishPendingBadge />
            ) : (
              <span className="inline-flex flex-wrap items-center gap-2">
                {article.title}
                <ArticleVerifiedBadge article={article} />
              </span>
            )}
          </h3>

          {!englishPending && article.description && (
            <p
              className={cn(
                "mt-2 leading-relaxed text-muted-foreground",
                featured
                  ? "line-clamp-4 text-sm md:text-base"
                  : "line-clamp-3 text-sm",
                !isAudio && "flex-1",
              )}
            >
              {article.description}
            </p>
          )}
        </Link>

        {isAudio ? (
          <div className="relative z-10 mt-auto pt-3">
            <Link to={articleHref} className="home-card-listen">
              <Play className="size-4 fill-current" />
              {common.listenNow}
            </Link>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <time className="text-xs text-muted-foreground">
            {new Date(article.published_at).toLocaleDateString(dateLocale)}
          </time>
          <div className="flex items-center gap-2">
            <ArticleTranslateButton
              articleId={article.id}
              contentLang={locale}
              compact
            />
            <Link
              to={articleHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100"
            >
              {isAudio ? common.listenNow : common.readMore}
              <CtaArrow className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
