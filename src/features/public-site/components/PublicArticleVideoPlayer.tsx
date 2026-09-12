import { CoverImage } from "@/components/article/cover-image";
import {
  useLazyArticleMedia,
  type ArticleMediaScope,
} from "@/hooks/useLazyArticleMedia";
import {
  createYouTubePlayer,
  loadYouTubeIframeApi,
  resolveMediaUrl,
  resolvePublicArticleVideoSource,
  youtubeEmbedWithApi,
  YOUTUBE_STATE,
} from "@/lib/media";
import { cn } from "@/lib/utils";
import type { TrustMediaProgress } from "@/lib/site";
import { Loader2, Play } from "lucide-react";
import { useEffect, useId, useRef, type Ref } from "react";

interface PublicArticleVideoPlayerProps {
  articleId: number | string;
  scope?: ArticleMediaScope;
  title: string;
  posterUrl?: string | null;
  coverImage?: string | null;
  videoPoster?: string | null;
  className?: string;
  fill?: boolean;
  videoRef?: Ref<HTMLVideoElement>;
  onVideoProgress?: (progress: TrustMediaProgress) => void;
}

export function PublicArticleVideoPlayer({
  articleId,
  scope = "public",
  title,
  posterUrl,
  coverImage,
  videoPoster,
  className,
  fill = false,
  videoRef,
  onVideoProgress,
}: PublicArticleVideoPlayerProps) {
  const { media, isLoading, isError, request, requested } = useLazyArticleMedia(
    articleId,
    scope,
  );
  const source = media
    ? resolvePublicArticleVideoSource(media, { coverImage, videoPoster })
    : null;
  const poster = resolveMediaUrl(posterUrl) ?? undefined;

  if (requested && media && !source) {
    return (
      <div className={className}>
        <VideoPosterButton
          poster={poster}
          title={title}
          pending={false}
          failed
          fill={fill}
          onPlay={request}
        />
      </div>
    );
  }

  if (source?.kind === "youtube") {
    return (
      <YouTubeArticlePlayer
        embedUrl={source.embedUrl}
        title={title}
        className={className}
        fill={fill}
        autoPlay={requested}
        onProgress={onVideoProgress}
      />
    );
  }

  if (source?.kind === "file") {
    return (
      <div
        className={cn(
          "article-media-poster relative overflow-hidden rounded-2xl bg-black",
          !fill && "aspect-video",
          fill && "h-full aspect-auto rounded-none",
          className,
        )}
      >
        <video
          ref={videoRef}
          src={source.url}
          poster={poster}
          controls
          autoPlay={requested}
          className="size-full object-contain"
          onTimeUpdate={(event) =>
            emitVideoProgress(event.currentTarget, onVideoProgress)
          }
          onPlay={(event) =>
            emitVideoProgress(event.currentTarget, onVideoProgress)
          }
          onPause={(event) =>
            emitVideoProgress(event.currentTarget, onVideoProgress)
          }
          onEnded={(event) =>
            emitVideoProgress(event.currentTarget, onVideoProgress, true)
          }
        />
      </div>
    );
  }

  if (source?.kind === "external") {
    return (
      <div className={cn("space-y-3", className)}>
        <VideoPosterButton
          poster={poster}
          title={title}
          pending={false}
          fill={fill}
          onPlay={() => window.open(source.pageUrl, "_blank", "noopener,noreferrer")}
        />
        <a
          href={source.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          مشاهدة على المنصة الخارجية
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      <VideoPosterButton
        poster={poster}
        title={title}
        pending={isLoading}
        failed={isError}
        fill={fill}
        onPlay={request}
      />
    </div>
  );
}

function emitVideoProgress(
  video: HTMLVideoElement,
  onVideoProgress?: (progress: TrustMediaProgress) => void,
  ended = false,
) {
  onVideoProgress?.({
    currentTime: video.currentTime,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    isPlaying: !video.paused && !video.ended,
    ended: ended || video.ended,
  });
}

function YouTubeArticlePlayer({
  embedUrl,
  title,
  className,
  fill,
  autoPlay,
  onProgress,
}: {
  embedUrl: string;
  title: string;
  className?: string;
  fill: boolean;
  autoPlay: boolean;
  onProgress?: (progress: TrustMediaProgress) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeId = useId().replace(/:/g, "");
  const src = youtubeEmbedWithApi(embedUrl, autoPlay);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !onProgress) return;

    let cancelled = false;
    let interval = 0;
    let player: ReturnType<typeof createYouTubePlayer> = null;

    const emit = (ended = false) => {
      if (!player || cancelled) return;
      const currentTime = player.getCurrentTime() || 0;
      const duration = player.getDuration() || 0;
      const state = player.getPlayerState();
      onProgress({
        currentTime,
        duration,
        isPlaying: state === YOUTUBE_STATE.PLAYING,
        ended: ended || state === YOUTUBE_STATE.ENDED,
      });
    };

    void loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !iframeRef.current) return;
        player = createYouTubePlayer(iframeRef.current, {
          onReady: () => emit(),
          onStateChange: (state) => {
            window.clearInterval(interval);
            if (state === YOUTUBE_STATE.PLAYING) {
              emit();
              interval = window.setInterval(() => emit(), 500);
              return;
            }
            emit(state === YOUTUBE_STATE.ENDED);
          },
        });
      })
      .catch(() => {
        /* iframe API unavailable — scroll-to-end still opens the survey */
      });

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      player?.destroy();
    };
  }, [src, onProgress]);

  return (
    <div
      className={cn(
        "article-media-poster relative overflow-hidden rounded-2xl bg-black",
        !fill && "aspect-video",
        fill && "h-full aspect-auto rounded-none",
        className,
      )}
    >
      <iframe
        id={iframeId}
        ref={iframeRef}
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}

function VideoPosterButton({
  poster,
  title,
  pending,
  failed = false,
  fill = false,
  onPlay,
}: {
  poster?: string;
  title: string;
  pending: boolean;
  failed?: boolean;
  fill?: boolean;
  onPlay: () => void;
}) {
  return (
    <button
      type="button"
      className={cn("article-media-poster", fill && "h-full aspect-auto rounded-none")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!pending) onPlay();
      }}
      disabled={pending}
      aria-label={pending ? "جاري التحميل" : `تشغيل فيديو: ${title}`}
    >
      <CoverImage
        src={poster}
        alt={title}
        className="article-media-poster__image size-full object-cover"
      />
      <span className="article-media-poster__scrim" aria-hidden />
      <span className="article-media-poster__play" aria-hidden>
        {pending ? (
          <Loader2 className="size-7 animate-spin" />
        ) : (
          <Play className="size-7 fill-current" />
        )}
      </span>
      {failed ? (
        <span className="article-media-poster__error">تعذّر تحميل المصدر</span>
      ) : null}
    </button>
  );
}
