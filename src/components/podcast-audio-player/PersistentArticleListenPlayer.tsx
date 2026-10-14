import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { useArticleListen } from "@/context/article-listen";

export function PersistentArticleListenPlayer() {
  const listen = useArticleListen();
  if (!listen?.track) return null;

  const { track, reportProgress } = listen;

  return (
    <PodcastAudioPlayer
      key={String(track.articleId)}
      seed={track.seed}
      url={track.url}
      title={track.title}
      coverUrl={track.coverUrl}
      variant="dock"
      interactive
      autoPlay
      resumeId={track.articleId}
      onPlaybackProgress={(progress) =>
        reportProgress(progress.isPlaying, progress.duration)
      }
    />
  );
}
