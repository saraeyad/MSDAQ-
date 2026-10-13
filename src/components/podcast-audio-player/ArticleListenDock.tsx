import { usePublicCopy } from "@/context/locale";
import { formatAudioTime } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, RotateCw, Share2, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { WaveformBars } from "./WaveformBars";

export function ListenMicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="9"
        y="2.5"
        width="6"
        height="11"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 11.5a6 6 0 0 0 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 17.5v3M8.5 20.5h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ListenWaveIcon() {
  return (
    <span className="article-listen-row__waves" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function formatPlaybackRate(rate: number) {
  return Number.isInteger(rate) ? `${rate.toFixed(1)}x` : `${rate}x`;
}

export function ArticleListenRow({
  className,
  isPlaying,
  playPending,
  playDisabled,
  durationSeconds,
  durationKnown,
  onPlayClick,
}: {
  className?: string;
  isPlaying: boolean;
  playPending?: boolean;
  playDisabled?: boolean;
  durationSeconds: number;
  durationKnown?: boolean;
  onPlayClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const { article: articleCopy, articleMedia } = usePublicCopy();
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  const listenLabel = playPending
    ? articleCopy.loadingMedia
    : durationKnown
      ? articleMedia.listenFor(minutes)
      : articleMedia.listen;

  const shareArticle = () => {
    const url = window.location.href;
    const pageTitle = document.title;
    if (navigator.share) {
      void navigator.share({ title: pageTitle, url }).catch(() => undefined);
      return;
    }
    void navigator.clipboard?.writeText(url);
  };

  return (
    <div className={cn("article-listen-row", className)}>
      <button
        type="button"
        className="article-listen-row__action"
        onClick={onPlayClick}
        disabled={playDisabled || playPending}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? articleMedia.playerPause : listenLabel}
      >
        <span
          className={cn(
            "article-listen-row__mark",
            isPlaying && "article-listen-row__mark--playing",
          )}
        >
          {isPlaying ? <ListenWaveIcon /> : <ListenMicIcon />}
        </span>
        <span>{listenLabel}</span>
      </button>
      <button
        type="button"
        className="article-listen-row__action"
        onClick={shareArticle}
      >
        <span className="article-listen-row__mark">
          <Share2 strokeWidth={1.75} />
        </span>
        <span>{articleMedia.share}</span>
      </button>
    </div>
  );
}

interface ArticleListenDockProps {
  seed: number | string;
  title?: string;
  coverUrl?: string;
  isPlaying: boolean;
  playPending: boolean;
  currentTime: number;
  durationSeconds: number;
  durationKnown: boolean;
  progress: number;
  playbackRate?: number;
  muted?: boolean;
  onPlayClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onPause: () => void;
  onSeek?: (ratio: number) => void;
  onSeekEnd?: () => void;
  onSkip?: (seconds: number) => void;
  onCycleRate?: () => void;
  onToggleMute?: () => void;
  onClose: () => void;
}

export function ArticleListenDock({
  seed,
  title,
  coverUrl,
  isPlaying,
  playPending,
  currentTime,
  durationSeconds,
  durationKnown,
  progress,
  playbackRate = 1,
  muted = false,
  onPlayClick,
  onPause,
  onSeek,
  onSeekEnd,
  onSkip,
  onCycleRate,
  onToggleMute,
  onClose,
}: ArticleListenDockProps) {
  const { articleMedia } = usePublicCopy();
  const waveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.classList.add("article-listen-dock-open");
    return () => document.body.classList.remove("article-listen-dock-open");
  }, []);

  const seekFromClientX = (clientX: number) => {
    if (!onSeek || !durationKnown || !waveRef.current) return;
    const rect = waveRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(ratio);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek || !durationKnown) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromClientX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    seekFromClientX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    event.stopPropagation();
    onSeekEnd?.();
  };

  const totalLabel = durationKnown ? formatAudioTime(durationSeconds) : "–:––";

  return createPortal(
    <div className="article-listen-dock" role="region" aria-label={articleMedia.playerRegion}>
      <div className="article-listen-dock__clip">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="article-listen-dock__thumb" />
        ) : (
          <span className="article-listen-dock__thumb article-listen-dock__thumb--empty" />
        )}
        {title ? <p className="article-listen-dock__title">{title}</p> : null}
      </div>

      <div className="article-listen-dock__timeline" dir="ltr">
        <span className="article-listen-dock__time">{formatAudioTime(currentTime)}</span>
        <div
          ref={waveRef}
          className={cn(
            "article-listen-dock__wave",
            onSeek && durationKnown && "article-listen-dock__wave--seekable",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <WaveformBars
            seed={seed}
            barCount={42}
            progress={durationKnown ? progress : 0}
            className="waveform-bars--dark waveform-bars--dock"
          />
        </div>
        <span className="article-listen-dock__time">{totalLabel}</span>
      </div>

      <div className="article-listen-dock__transport">
        <button
          type="button"
          className="article-listen-dock__skip"
          onClick={() => onSkip?.(-15)}
          disabled={!onSkip}
          aria-label={articleMedia.playerRewind}
        >
          <RotateCcw className="size-5" strokeWidth={1.75} />
          <span>15</span>
        </button>
        <button
          type="button"
          className="article-listen-dock__play"
          onClick={onPlayClick}
          disabled={playPending}
          aria-label={isPlaying ? articleMedia.playerPause : articleMedia.playerPlay}
        >
          {isPlaying ? (
            <Pause className="size-5 fill-current" />
          ) : (
            <Play className="size-5 fill-current" />
          )}
        </button>
        <button
          type="button"
          className="article-listen-dock__skip"
          onClick={() => onSkip?.(15)}
          disabled={!onSkip}
          aria-label={articleMedia.playerForward}
        >
          <RotateCw className="size-5" strokeWidth={1.75} />
          <span>15</span>
        </button>
      </div>

      <div className="article-listen-dock__tools">
        {onToggleMute ? (
          <button
            type="button"
            className="article-listen-dock__tool"
            onClick={onToggleMute}
            aria-label={muted ? articleMedia.playerUnmute : articleMedia.playerMute}
            aria-pressed={muted}
          >
            {muted ? (
              <VolumeX className="size-5" strokeWidth={1.75} />
            ) : (
              <Volume2 className="size-5" strokeWidth={1.75} />
            )}
          </button>
        ) : null}
        {onCycleRate ? (
          <button
            type="button"
            className="article-listen-dock__rate"
            onClick={onCycleRate}
            aria-label={`${articleMedia.playerSpeed} ${formatPlaybackRate(playbackRate)}`}
          >
            {formatPlaybackRate(playbackRate)}
          </button>
        ) : null}
        <button
          type="button"
          className="article-listen-dock__tool"
          onClick={() => {
            onPause();
            onClose();
          }}
          aria-label={articleMedia.playerClose}
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
