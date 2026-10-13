import { ArticleListenRow } from "@/components/podcast-audio-player/ArticleListenDock";
import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { useArticleListen } from "@/context/article-listen";
import { usePublicCopy } from "@/context/locale";
import {
  useLazyArticleMedia,
  type ArticleMediaScope,
} from "@/hooks/useLazyArticleMedia";
import {
  publicArticleNarrationUrl,
  resolvePublicArticleAudioSource,
} from "@/lib/media";
import type { TrustMediaProgress } from "@/lib/site";
import { useEffect, useState } from "react";

interface PublicArticleAudioPlayerProps {
  articleId: number | string;
  scope?: ArticleMediaScope;
  variant?: "inline" | "embed" | "cover" | "article";
  className?: string;
  coverUrl?: string;
  title?: string;
  showSourceLink?: boolean;
  onPlaybackProgress?: (progress: TrustMediaProgress) => void;
  /** Fetch and start playback as soon as this player mounts. */
  startOnMount?: boolean;
  /** Fetch the source so a saved position can show on the line without playing. */
  loadOnMount?: boolean;
  /** Play the article's generated narration when the server has saved one. */
  preferNarration?: boolean;
}

export function PublicArticleAudioPlayer({
  articleId,
  scope = "public",
  variant = "inline",
  className,
  coverUrl,
  title,
  showSourceLink = false,
  onPlaybackProgress,
  startOnMount = false,
  loadOnMount = false,
  preferNarration = false,
}: PublicArticleAudioPlayerProps) {
  const persist = useArticleListen();
  const { articleMedia } = usePublicCopy();
  const [playRequested, setPlayRequested] = useState(startOnMount);
  const { media, isLoading, request, requested } = useLazyArticleMedia(
    articleId,
    scope,
    { requestOnMount: startOnMount || loadOnMount },
  );
  const source = media ? resolvePublicArticleAudioSource(media) : null;
  const narrationUrl = media ? publicArticleNarrationUrl(media) : null;
  const useNarration = Boolean(preferNarration && narrationUrl);
  const fileUrl = useNarration
    ? narrationUrl
    : source?.kind === "file"
      ? source.url
      : !source
        ? narrationUrl
        : null;
  const soundcloudUrl =
    !useNarration && source?.kind === "soundcloud" ? source.pageUrl : null;
  const externalUrl =
    !useNarration && source?.kind === "external" ? source.pageUrl : null;
  const persistArticle = Boolean(persist && variant === "article" && !soundcloudUrl);

  useEffect(() => {
    if (!persistArticle || !persist || !playRequested || !fileUrl) return;
    if (persist.isCurrent(articleId)) return;
    persist.start({
      articleId,
      seed: articleId,
      url: fileUrl,
      title,
      coverUrl,
    });
  }, [
    persistArticle,
    persist,
    playRequested,
    fileUrl,
    articleId,
    title,
    coverUrl,
  ]);

  if (requested && media && !fileUrl && !soundcloudUrl && !externalUrl) {
    return (
      <p className="text-sm text-muted-foreground">{articleMedia.noAudio}</p>
    );
  }

  if (externalUrl && !fileUrl && !soundcloudUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-primary hover:underline"
        onClick={(event) => event.stopPropagation()}
      >
        {articleMedia.listenExternal}
      </a>
    );
  }

  if (persistArticle && persist) {
    const current = persist.isCurrent(articleId);
    return (
      <ArticleListenRow
        className={className}
        isPlaying={current && persist.isPlaying}
        playPending={playRequested && isLoading}
        durationSeconds={current ? persist.durationSeconds : 0}
        durationKnown={current && persist.durationKnown}
        onPlayClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (current) {
            persist.toggle();
            return;
          }
          setPlayRequested(true);
          request();
          if (fileUrl) {
            persist.start({
              articleId,
              seed: articleId,
              url: fileUrl,
              title,
              coverUrl,
            });
          }
        }}
      />
    );
  }

  return (
    <PodcastAudioPlayer
      seed={articleId}
      url={fileUrl}
      hostedPageUrl={soundcloudUrl}
      variant={variant}
      interactive
      className={className}
      coverUrl={coverUrl}
      title={title}
      showSourceLink={showSourceLink}
      onPlaybackProgress={onPlaybackProgress}
      autoPlay={playRequested && requested && Boolean(fileUrl || soundcloudUrl)}
      resumeId={articleId}
      onNeedSource={() => {
        setPlayRequested(true);
        request();
      }}
      sourcePending={isLoading}
    />
  );
}
