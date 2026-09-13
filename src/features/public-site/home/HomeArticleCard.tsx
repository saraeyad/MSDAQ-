import { PublicArticleCover } from "@/components/article/cover-image";
import { ArticleVerifiedBadge } from "@/components/article/article-verified-badge";
import { mediaTypeLabel, publicArticleCoverUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { articlePath } from "@/router/routes";
import type { PublicArticle, PublicMediaType } from "@/types";
import { ArrowLeft, FileText, Mic, Play, Video } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";

const PublicArticleAudioPlayer = lazy(() =>
  import("@/features/public-site/components/PublicArticleAudioPlayer").then(
    (module) => ({ default: module.PublicArticleAudioPlayer }),
  ),
);
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

interface HomeArticleCardProps {
  article: PublicArticle;
  featured?: boolean;
  wide?: boolean;
  index?: number;
  className?: string;
}

export function HomeArticleCard({
  article,
  featured = false,
  wide = false,
  index = 0,
  className,
}: HomeArticleCardProps) {
  const [mediaStarted, setMediaStarted] = useState(false);
  const Icon = MEDIA_ICONS[article.media_type] ?? FileText;
  const badge = article.category?.name_ar ?? mediaTypeLabel(article.media_type);
  const isAudio = article.media_type === "audio";
  const isVideo = article.media_type === "video";
  const articleHref = articlePath(article.id);
  const posterUrl = publicArticleCoverUrl(article);

  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
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
            aria-label={`تشغيل فيديو: ${article.title}`}
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
            <span className="inline-flex flex-wrap items-center gap-2">
              {article.title}
              <ArticleVerifiedBadge article={article} />
            </span>
          </h3>

          {article.description && (
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
            {mediaStarted ? (
              <Suspense
                fallback={
                  <div className="home-card-listen" aria-hidden>
                    <Play className="size-4 fill-current" />
                    <span>جاري التحميل…</span>
                  </div>
                }
              >
                <PublicArticleAudioPlayer
                  articleId={article.id}
                  variant="inline"
                  startOnMount
                  className="w-full"
                />
              </Suspense>
            ) : (
              <button
                type="button"
                className="home-card-listen"
                onClick={() => setMediaStarted(true)}
              >
                <Play className="size-4 fill-current" />
                استمع الآن
              </button>
            )}
          </div>
        ) : null}

        <Link
          to={articleHref}
          className="mt-4 flex items-center justify-between border-t border-border/60 pt-4"
        >
          <time className="text-xs text-muted-foreground">
            {new Date(article.published_at).toLocaleDateString("ar")}
          </time>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
            {isAudio ? "استمع الآن" : "اقرأ المزيد"}
            <ArrowLeft className="size-3.5" />
          </span>
        </Link>
      </div>
    </article>
  );
}
