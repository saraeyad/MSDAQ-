import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import {
  useLazyArticleMedia,
  type ArticleMediaScope,
} from "@/hooks/useLazyArticleMedia";
import {
  publicArticleNarrationUrl,
  resolvePublicArticleAudioSource,
} from "@/lib/media";
import type { TrustMediaProgress } from "@/lib/site";

interface PublicArticleAudioPlayerProps {
  articleId: number | string;
  scope?: ArticleMediaScope;
  variant?: "inline" | "embed" | "cover";
  className?: string;
  coverUrl?: string;
  showSourceLink?: boolean;
  onPlaybackProgress?: (progress: TrustMediaProgress) => void;
}

export function PublicArticleAudioPlayer({
  articleId,
  scope = "public",
  variant = "inline",
  className,
  coverUrl,
  showSourceLink = false,
  onPlaybackProgress,
}: PublicArticleAudioPlayerProps) {
  const { media, isLoading, request, requested } = useLazyArticleMedia(
    articleId,
    scope,
  );
  const source = media ? resolvePublicArticleAudioSource(media) : null;
  const narrationUrl = media ? publicArticleNarrationUrl(media) : null;
  const fileUrl =
    source?.kind === "file" ? source.url : !source ? narrationUrl : null;
  const soundcloudUrl = source?.kind === "soundcloud" ? source.pageUrl : null;
  const externalUrl = source?.kind === "external" ? source.pageUrl : null;

  if (requested && media && !fileUrl && !soundcloudUrl && !externalUrl) {
    return (
      <p className="text-sm text-muted-foreground">لا يتوفر مصدر صوتي</p>
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
        استمع على المنصة الخارجية
      </a>
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
      showSourceLink={showSourceLink}
      onPlaybackProgress={onPlaybackProgress}
      autoPlay={requested && Boolean(fileUrl || soundcloudUrl)}
      onNeedSource={request}
      sourcePending={isLoading}
    />
  );
}
