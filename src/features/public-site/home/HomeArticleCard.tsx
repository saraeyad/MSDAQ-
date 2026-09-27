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

type HomeArticleCardVariant = "default" | "compact" | "audioRow" | "podcast";

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

  if (variant === "compact") {
    return (
      <article
        style={{ animationDelay: `${index * 40}ms`, ...edgeShift }}
        className={cn("home-feed-stack-item news-card-enter group", className)}
      >
        <div className="home-feed-stack-item__link">
          <Link to={articleHref} className="home-feed-stack-item__visual">
            <span className="home-feed-stack-item__type">{badge}</span>
            <span className="home-feed-stack-item__thumb">
              <PublicArticleCover
                article={article}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="home-feed-stack-item__media" aria-hidden>
                <Icon className="size-3.5" />
              </span>
            </span>
          </Link>
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
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  {article.title}
                  <ArticleVerifiedBadge article={article} />
                </span>
              )}
            </Link>
            <time className="home-feed-stack-item__date">
              {new Date(article.published_at).toLocaleDateString(dateLocale)}
            </time>
          </span>
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
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="home-podcast__body">
          <div className="home-podcast__top">
            <span className="home-podcast__badge">{badge}</span>
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
          <div className="home-podcast__foot">
            <time dateTime={article.published_at}>
              {new Date(article.published_at).toLocaleDateString(dateLocale)}
            </time>
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
            <time className="home-feed-audio-row__date">
              {new Date(article.published_at).toLocaleDateString(dateLocale)}
            </time>
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
        featured ? "min-h-[320px] lg:min-h-[360px]" : "min-h-[280px]",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          wide ? "h-44 lg:h-auto lg:w-2/5" : featured ? "h-48" : "h-36",
        )}
      >
        {isVideo && mediaStarted ? (
          <Suspense
            fallback={
              <PublicArticleCover
                article={article}
                priority={featured || index === 0}
                className="size-full object-cover"
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
            className="article-media-poster absolute inset-0 h-full aspect-auto rounded-none"
            onClick={() => setMediaStarted(true)}
            aria-label={articleCopy.playVideo(
              englishPending ? articleCopy.englishPendingTitle : article.title,
            )}
          >
            <PublicArticleCover
              article={article}
              priority={featured || index === 0}
              className="article-media-poster__image size-full object-cover"
            />
            <span className="article-media-poster__scrim" aria-hidden />
            <span className="article-media-poster__play" aria-hidden>
              <Play className="size-7 fill-current" />
            </span>
          </button>
        ) : (
          <Link to={articleHref} className="absolute inset-0 block">
            <PublicArticleCover
              article={article}
              priority={featured || index === 0}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

        <span className="pointer-events-none absolute top-3 start-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
          {badge}
        </span>
        <span className="pointer-events-none absolute top-3 end-3 flex size-9 items-center justify-center rounded-xl bg-card/90 text-primary shadow-md backdrop-blur-sm">
          <Icon className="size-4" />
        </span>
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
