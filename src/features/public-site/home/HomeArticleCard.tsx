import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { PublicArticleCover } from "@/lib/cover-image";
import { mediaTypeLabel, resolvePublicArticleAudioSource } from "@/lib/media-labels";
import { cn } from "@/lib/utils";
import type { PublicArticle, PublicMediaType } from "@/types";
import { ArrowLeft, FileText, Mic, Video } from "lucide-react";
import { Link } from "react-router-dom";

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
  const Icon = MEDIA_ICONS[article.media_type] ?? FileText;
  const badge = article.category?.name_ar ?? mediaTypeLabel(article.media_type);
  const isAudio = article.media_type === "audio";
  const audioSource = resolvePublicArticleAudioSource(article);
  const hasCover = Boolean(article.cover_image || article.images?.length);
  const articleHref = `/articles/${article.id}`;

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
      <Link
        to={articleHref}
        className={cn(
          "relative shrink-0 overflow-hidden",
          wide ? "h-44 lg:h-auto lg:w-2/5" : featured ? "h-48" : "h-36",
        )}
      >
        {isAudio && !hasCover ? (
          <PodcastAudioPlayer
            seed={article.id}
            url={audioSource?.kind === "file" ? audioSource.url : null}
            hostedPageUrl={
              audioSource?.kind === "soundcloud" ? audioSource.pageUrl : null
            }
            variant="cover"
            interactive={false}
            className="size-full"
          />
        ) : (
          <PublicArticleCover
            article={article}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

        <span className="absolute top-3 start-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
          {badge}
        </span>
        <span className="absolute top-3 end-3 flex size-9 items-center justify-center rounded-xl bg-card/90 text-primary shadow-md backdrop-blur-sm">
          <Icon className="size-4" />
        </span>
      </Link>

      <div className="relative flex flex-1 flex-col p-5">
        <div className="absolute start-0 top-0 h-0 w-1 rounded-full bg-primary transition-all duration-300 group-hover:h-full" />

        <Link to={articleHref} className="block">
          <h3
            className={cn(
              "font-headline font-bold leading-snug transition-colors group-hover:text-primary",
              featured ? "text-xl md:text-2xl" : "text-base md:text-lg",
            )}
          >
            {article.title}
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

        {isAudio && audioSource && (
          <div className="relative z-10 mt-auto pt-3">
            <PodcastAudioPlayer
              seed={article.id}
              url={audioSource.kind === "file" ? audioSource.url : null}
              hostedPageUrl={
                audioSource.kind === "soundcloud" ? audioSource.pageUrl : null
              }
              variant="inline"
              interactive
              className="w-full"
            />
          </div>
        )}

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
