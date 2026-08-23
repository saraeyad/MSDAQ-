import {
  estimateDurationFromSeed,
  formatAudioTime,
} from "@/lib/waveform";
import {
  buildSoundCloudWidgetUrl,
  createSoundCloudWidget,
  loadSoundCloudWidgetApi,
} from "@/lib/soundcloud-widget";
import type { TrustMediaProgress } from "@/lib/trust-index-labels";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { WaveformBars } from "./WaveformBars";

type PodcastAudioPlayerVariant = "inline" | "embed" | "cover";

interface PodcastAudioPlayerProps {
  seed: number | string;
  url?: string | null;
  hostedPageUrl?: string | null;
  duration?: number;
  variant?: PodcastAudioPlayerVariant;
  interactive?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  coverUrl?: string;
  onPlaybackProgress?: (progress: TrustMediaProgress) => void;
}

function waveBarCount(variant: PodcastAudioPlayerVariant) {
  if (variant === "cover") return 88;
  if (variant === "embed") return 72;
  return 56;
}

function waveBarClass(variant: PodcastAudioPlayerVariant) {
  const isDark = variant === "embed" || variant === "cover";
  return cn(
    isDark && "waveform-bars--dark",
    variant === "cover" && "waveform-bars--cover",
    variant === "inline" && "waveform-bars--inline",
    variant === "embed" && "waveform-bars--embed",
  );
}

interface WaveformPlayerShellProps {
  seed: number | string;
  variant?: PodcastAudioPlayerVariant;
  className?: string;
  title?: string;
  subtitle?: string;
  coverUrl?: string;
  isPlaying: boolean;
  currentTime: number;
  durationSeconds: number;
  playDisabled?: boolean;
  onPlayClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onSeek?: (ratio: number) => void;
  hiddenBridge?: ReactNode;
}

function WaveformPlayerShell({
  seed,
  variant = "inline",
  className,
  title,
  subtitle,
  coverUrl,
  isPlaying,
  currentTime,
  durationSeconds,
  playDisabled = false,
  onPlayClick,
  onSeek,
  hiddenBridge,
}: WaveformPlayerShellProps) {
  const waveRef = useRef<HTMLDivElement | null>(null);
  const isDark = variant === "embed";

  const progress =
    durationSeconds > 0 ? Math.min(1, currentTime / durationSeconds) : 0;

  const timeLabel =
    isPlaying || currentTime > 0
      ? formatAudioTime(currentTime)
      : formatAudioTime(durationSeconds);

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onSeek || !waveRef.current || durationSeconds <= 0) return;

    const rect = waveRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );
    onSeek(ratio);
  };

  if (variant === "cover") {
    return (
      <div
        className={cn("podcast-cover-placeholder", className)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {hiddenBridge}
        <WaveformBars
          seed={seed}
          barCount={waveBarCount(variant)}
          progress={progress}
          className={waveBarClass(variant)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "podcast-player",
        variant === "inline" && "podcast-player--inline",
        isDark && "podcast-player--embed",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {hiddenBridge}

      {coverUrl && variant === "embed" ? (
        <img src={coverUrl} alt="" className="podcast-player__cover" />
      ) : null}

      <span className="podcast-player__time">{timeLabel}</span>

      <div className="podcast-player__body">
        {(title || subtitle) && (
          <div className="podcast-player__meta">
            {title ? <p className="podcast-player__title">{title}</p> : null}
            {subtitle ? (
              <p className="podcast-player__subtitle">{subtitle}</p>
            ) : null}
          </div>
        )}
        <div
          ref={waveRef}
          className={cn(
            "podcast-player__wave",
            onSeek && "podcast-player__wave--seekable",
          )}
          onClick={onSeek ? handleSeek : undefined}
          aria-label={onSeek ? "موجّة الصوت — انقر للانتقال" : undefined}
        >
          <WaveformBars
            seed={seed}
            barCount={waveBarCount(variant)}
            progress={progress}
            className={waveBarClass(variant)}
          />
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "podcast-player__play",
          isDark && "podcast-player__play--embed",
          playDisabled && "podcast-player__play--disabled",
        )}
        onClick={onPlayClick}
        onPointerDown={(event) => event.stopPropagation()}
        disabled={playDisabled}
        aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
      >
        {isPlaying ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current" />
        )}
      </button>
    </div>
  );
}

function PodcastAudioPlayerDecorative({
  seed,
  duration,
  variant = "inline",
  className,
  title,
  subtitle,
  coverUrl,
}: PodcastAudioPlayerProps) {
  const totalDuration = duration ?? estimateDurationFromSeed(seed);

  return (
    <WaveformPlayerShell
      seed={seed}
      variant={variant}
      className={className}
      title={title}
      subtitle={subtitle}
      coverUrl={coverUrl}
      isPlaying={false}
      currentTime={0}
      durationSeconds={totalDuration}
      playDisabled
      onPlayClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    />
  );
}

function PodcastAudioPlayerFile({
  seed,
  url,
  duration,
  variant = "inline",
  className,
  title,
  subtitle,
  coverUrl,
  onPlaybackProgress,
}: PodcastAudioPlayerProps & { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onProgressRef = useRef(onPlaybackProgress);
  onProgressRef.current = onPlaybackProgress;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(
    () => duration ?? estimateDurationFromSeed(seed),
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setIsPlaying(false);
    audio.load();

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDurationSeconds(audio.duration);
      }
    };

    const emit = (
      next: Partial<TrustMediaProgress> & Pick<TrustMediaProgress, "currentTime">,
    ) => {
      onProgressRef.current?.({
        currentTime: next.currentTime,
        duration:
          Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : durationSeconds,
        isPlaying: next.isPlaying ?? !audio.paused,
        ended: next.ended,
      });
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      emit({ currentTime: audio.currentTime });
    };
    const onPlay = () => {
      setIsPlaying(true);
      emit({ currentTime: audio.currentTime, isPlaying: true });
    };
    const onPause = () => {
      setIsPlaying(false);
      emit({ currentTime: audio.currentTime, isPlaying: false });
    };
    const onEnded = () => {
      setIsPlaying(false);
      emit({ currentTime: audio.duration || audio.currentTime, isPlaying: false, ended: true });
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("canplay", syncDuration);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    syncDuration();

    return () => {
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("canplay", syncDuration);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [url]);

  useEffect(() => {
    if (duration != null && duration > 0) {
      setDurationSeconds(duration);
    }
  }, [duration]);

  const handlePlay = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    void audio.play().catch(() => {
      /* blocked or missing source */
    });
  };

  const handleSeek = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || durationSeconds <= 0) return;
    audio.currentTime = ratio * durationSeconds;
    setCurrentTime(audio.currentTime);
  };

  return (
    <WaveformPlayerShell
      seed={seed}
      variant={variant}
      className={className}
      title={title}
      subtitle={subtitle}
      coverUrl={coverUrl}
      isPlaying={isPlaying}
      currentTime={currentTime}
      durationSeconds={durationSeconds}
      onPlayClick={handlePlay}
      onSeek={variant === "cover" ? undefined : handleSeek}
      hiddenBridge={
        <audio ref={audioRef} src={url} preload="auto" hidden />
      }
    />
  );
}

function PodcastAudioPlayerSoundCloud({
  seed,
  pageUrl,
  duration,
  variant = "inline",
  className,
  title,
  subtitle,
  coverUrl,
  onPlaybackProgress,
}: PodcastAudioPlayerProps & { pageUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const onProgressRef = useRef(onPlaybackProgress);
  onProgressRef.current = onPlaybackProgress;
  const widgetRef = useRef<ReturnType<typeof createSoundCloudWidget> | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(
    () => duration ?? estimateDurationFromSeed(seed),
  );
  const [isReady, setIsReady] = useState(false);

  const widgetSrc = buildSoundCloudWidgetUrl(pageUrl);

  useEffect(() => {
    let cancelled = false;

    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    widgetRef.current = null;

    void loadSoundCloudWidgetApi()
      .then(() => {
        if (cancelled || !iframeRef.current || !window.SC?.Widget) return;

        const widget = createSoundCloudWidget(iframeRef.current);
        if (!widget) return;

        widgetRef.current = widget;
        const { Events } = window.SC.Widget;

        widget.bind(Events.READY, () => {
          if (cancelled) return;
          widget.getDuration((ms) => {
            if (ms > 0) setDurationSeconds(ms / 1000);
          });
          setIsReady(true);
        });

        widget.bind(Events.PLAY, () => {
          if (cancelled) return;
          setIsPlaying(true);
          widget.getPosition((ms) => {
            widget.getDuration((durationMs) => {
              onProgressRef.current?.({
                currentTime: ms / 1000,
                duration: durationMs > 0 ? durationMs / 1000 : 0,
                isPlaying: true,
              });
            });
          });
        });

        widget.bind(Events.PAUSE, () => {
          if (cancelled) return;
          setIsPlaying(false);
          widget.getPosition((ms) => {
            widget.getDuration((durationMs) => {
              onProgressRef.current?.({
                currentTime: ms / 1000,
                duration: durationMs > 0 ? durationMs / 1000 : 0,
                isPlaying: false,
              });
            });
          });
        });

        widget.bind(Events.PLAY_PROGRESS, (data) => {
          if (cancelled || data?.currentPosition == null) return;
          const nextTime = data.currentPosition / 1000;
          setCurrentTime(nextTime);
          widget.getDuration((durationMs) => {
            onProgressRef.current?.({
              currentTime: nextTime,
              duration: durationMs > 0 ? durationMs / 1000 : 0,
              isPlaying: true,
            });
          });
        });

        widget.bind(Events.FINISH, () => {
          if (cancelled) return;
          setIsPlaying(false);
          widget.getDuration((durationMs) => {
            const durationSec = durationMs > 0 ? durationMs / 1000 : 0;
            onProgressRef.current?.({
              currentTime: durationSec,
              duration: durationSec,
              isPlaying: false,
              ended: true,
            });
          });
          setCurrentTime(0);
        });
      })
      .catch(() => {
        if (!cancelled) setIsReady(false);
      });

    return () => {
      cancelled = true;
      widgetRef.current = null;
    };
  }, [pageUrl, widgetSrc]);

  useEffect(() => {
    if (duration != null && duration > 0) {
      setDurationSeconds(duration);
    }
  }, [duration]);

  const handlePlay = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const widget = widgetRef.current;
    if (!widget || !isReady) return;
    widget.toggle();
  };

  const handleSeek = (ratio: number) => {
    const widget = widgetRef.current;
    if (!widget || !isReady || durationSeconds <= 0) return;
    widget.seekTo(ratio * durationSeconds * 1000);
    setCurrentTime(ratio * durationSeconds);
  };

  return (
    <WaveformPlayerShell
      seed={seed}
      variant={variant}
      className={className}
      title={title}
      subtitle={subtitle}
      coverUrl={coverUrl}
      isPlaying={isPlaying}
      currentTime={currentTime}
      durationSeconds={durationSeconds}
      playDisabled={!isReady}
      onPlayClick={handlePlay}
      onSeek={variant === "cover" ? undefined : handleSeek}
      hiddenBridge={
        <iframe
          key={widgetSrc}
          ref={iframeRef}
          title=""
          src={widgetSrc}
          className="podcast-player__soundcloud-bridge"
          allow="autoplay"
        />
      }
    />
  );
}

export function PodcastAudioPlayer({
  seed,
  url,
  hostedPageUrl,
  duration,
  variant = "inline",
  interactive = true,
  className,
  title,
  subtitle,
  coverUrl,
  onPlaybackProgress,
}: PodcastAudioPlayerProps) {
  if (interactive && hostedPageUrl) {
    return (
      <PodcastAudioPlayerSoundCloud
        seed={seed}
        pageUrl={hostedPageUrl}
        duration={duration}
        variant={variant}
        className={className}
        title={title}
        subtitle={subtitle}
        coverUrl={coverUrl}
        onPlaybackProgress={onPlaybackProgress}
      />
    );
  }

  if (interactive && url) {
    return (
      <PodcastAudioPlayerFile
        seed={seed}
        url={url}
        duration={duration}
        variant={variant}
        className={className}
        title={title}
        subtitle={subtitle}
        coverUrl={coverUrl}
        onPlaybackProgress={onPlaybackProgress}
      />
    );
  }

  return (
    <PodcastAudioPlayerDecorative
      seed={seed}
      duration={duration}
      variant={variant}
      className={className}
      title={title}
      subtitle={subtitle}
      coverUrl={coverUrl}
    />
  );
}
