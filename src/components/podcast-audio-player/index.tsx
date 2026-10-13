import {
  clearPlaybackPosition,
  estimateDurationFromSeed,
  formatAudioTime,
  readPlaybackPosition,
  writePlaybackPosition,
} from "@/lib/media";
import {
  buildSoundCloudWidgetUrl,
  createSoundCloudWidget,
  loadSoundCloudWidgetApi,
} from "@/lib/media";
import type { TrustMediaProgress } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useArticleListen } from "@/context/article-listen";
import { useLocale, usePublicCopy } from "@/context/locale";
import { ArrowUpLeft, ArrowUpRight, Loader2, Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ArticleListenDock, ArticleListenRow } from "./ArticleListenDock";
import { WaveformBars } from "./WaveformBars";

function SoundCloudMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M1.63 15.39c-.35 0-.63.27-.63.61s.28.61.63.61.63-.27.63-.61-.28-.61-.63-.61m2.1.05c-.38 0-.67.29-.67.7v3.4c0 .41.29.7.67.7s.68-.29.68-.7v-3.4c0-.41-.3-.7-.68-.7m2.15-.84c-.4 0-.73.33-.73.73v4.24c0 .4.33.73.73.73s.73-.33.73-.73v-4.24c0-.4-.33-.73-.73-.73m2.18-1.26c-.44 0-.8.36-.8.8v5.5c0 .45.36.8.8.8s.8-.35.8-.8v-5.5c0-.44-.36-.8-.8-.8m2.21-1.08c-.47 0-.86.38-.86.86v6.59c0 .47.39.86.86.86s.86-.39.86-.86v-6.59c0-.48-.39-.86-.86-.86m10.24.18c-.23 0-.45.03-.66.08-1.12-2.57-3.57-5-6.73-5-.37 0-.73.04-1.08.11v11.81h10.57A4.08 4.08 0 0 0 24 16.04a4.08 4.08 0 0 0-5.49-3.9"
      />
    </svg>
  );
}

type PodcastAudioPlayerVariant = "inline" | "embed" | "cover" | "article" | "dock";

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
  showSourceLink?: boolean;
  autoPlay?: boolean;
  onNeedSource?: () => void;
  sourcePending?: boolean;
  /** Persist and restore playback position for this article. */
  resumeId?: number | string;
}

function waveBarCount(variant: PodcastAudioPlayerVariant) {
  if (variant === "cover") return 88;
  if (variant === "embed") return 96;
  return 56;
}

function waveBarClass(variant: PodcastAudioPlayerVariant) {
  return cn(
    variant === "cover" && "waveform-bars--dark",
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
  durationKnown?: boolean;
  playbackRate?: number;
  muted?: boolean;
  playDisabled?: boolean;
  playPending?: boolean;
  onPlayClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onSeek?: (ratio: number) => void;
  onSeekEnd?: () => void;
  onSkip?: (seconds: number) => void;
  onCycleRate?: () => void;
  onToggleMute?: () => void;
  onPause?: () => void;
  hiddenBridge?: ReactNode;
  sourceUrl?: string | null;
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
  durationKnown = false,
  playbackRate = 1,
  muted = false,
  playDisabled = false,
  playPending = false,
  onPlayClick,
  onSeek,
  onSeekEnd,
  onSkip,
  onCycleRate,
  onToggleMute,
  onPause,
  hiddenBridge,
  sourceUrl,
}: WaveformPlayerShellProps) {
  const persist = useArticleListen();
  const { dir } = useLocale();
  const { articleMedia } = usePublicCopy();
  const waveRef = useRef<HTMLDivElement | null>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const isDark = variant === "embed";

  useEffect(() => {
    if (variant === "article" && isPlaying) setDockOpen(true);
  }, [variant, isPlaying]);
  const ExternalArrow = dir === "rtl" ? ArrowUpLeft : ArrowUpRight;

  const progress =
    durationSeconds > 0 ? Math.min(1, currentTime / durationSeconds) : 0;

  const timeLabel =
    isPlaying || currentTime > 0
      ? formatAudioTime(currentTime)
      : formatAudioTime(durationSeconds);

  const seekFromClientX = (clientX: number) => {
    if (!onSeek || !waveRef.current || durationSeconds <= 0) return;
    const rect = waveRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(ratio);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromClientX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    event.preventDefault();
    seekFromClientX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    event.stopPropagation();
    onSeekEnd?.();
  };

  if (variant === "dock") {
    return (
      <>
        {hiddenBridge}
        <ArticleListenDock
          seed={seed}
          title={title}
          coverUrl={coverUrl}
          isPlaying={isPlaying}
          playPending={playPending}
          currentTime={currentTime}
          durationSeconds={durationSeconds}
          durationKnown={durationKnown}
          progress={progress}
          playbackRate={playbackRate}
          muted={muted}
          onPlayClick={onPlayClick}
          onPause={() => onPause?.()}
          onSeek={onSeek}
          onSeekEnd={onSeekEnd}
          onSkip={onSkip}
          onCycleRate={onCycleRate}
          onToggleMute={onToggleMute}
          onClose={() => {
            onPause?.();
            persist?.close();
          }}
        />
      </>
    );
  }

  if (variant === "article") {
    return (
      <div className={className}>
        {hiddenBridge}
        <ArticleListenRow
          isPlaying={isPlaying}
          playPending={playPending}
          playDisabled={playDisabled}
          durationSeconds={durationSeconds}
          durationKnown={durationKnown}
          onPlayClick={(event) => {
            setDockOpen(true);
            onPlayClick(event);
          }}
        />
        {dockOpen ? (
          <ArticleListenDock
            seed={seed}
            title={title}
            coverUrl={coverUrl}
            isPlaying={isPlaying}
            playPending={playPending}
            currentTime={currentTime}
            durationSeconds={durationSeconds}
            durationKnown={durationKnown}
            progress={progress}
            playbackRate={playbackRate}
            muted={muted}
            onPlayClick={onPlayClick}
            onPause={() => onPause?.()}
            onSeek={onSeek}
            onSeekEnd={onSeekEnd}
            onSkip={onSkip}
            onCycleRate={onCycleRate}
            onToggleMute={onToggleMute}
            onClose={() => setDockOpen(false)}
          />
        ) : null}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            dir={dir}
            className="podcast-soundcloud-link"
            aria-label={articleMedia.listenOnSoundCloud}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="podcast-soundcloud-link__icon">
              <SoundCloudMark />
            </span>
            <span className="podcast-soundcloud-link__label">
              {articleMedia.listenOnSoundCloud}
            </span>
            <ExternalArrow className="podcast-soundcloud-link__arrow" />
          </a>
        ) : null}
      </div>
    );
  }

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
        "podcast-player-stack",
        isDark && "podcast-player-stack--embed",
        className,
      )}
    >
      <div
        className={cn(
          "podcast-player",
          variant === "inline" && "podcast-player--inline",
          isDark && "podcast-player--embed",
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
      {hiddenBridge}

      {coverUrl && variant === "embed" ? (
        <img
          src={coverUrl}
          alt=""
          className="podcast-player__cover"
          loading="lazy"
          decoding="async"
        />
      ) : null}

      <div className="podcast-player__aside">
        <span className="podcast-player__time">{timeLabel}</span>
      </div>

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
          onPointerDown={onSeek ? handlePointerDown : undefined}
          onPointerMove={onSeek ? handlePointerMove : undefined}
          onPointerUp={onSeek ? handlePointerUp : undefined}
          aria-label={onSeek ? "موجّة الصوت — اسحب للرجوع والاستئناف" : undefined}
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
        disabled={playDisabled || playPending}
        aria-label={
          playPending ? "جاري التحميل" : isPlaying ? "إيقاف مؤقت" : "تشغيل"
        }
      >
        {playPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current" />
        )}
      </button>
    </div>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          dir={dir}
          className={cn(
            "podcast-soundcloud-link",
            isDark && "podcast-soundcloud-link--embed",
          )}
          aria-label={articleMedia.listenOnSoundCloud}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <span className="podcast-soundcloud-link__icon">
            <SoundCloudMark />
          </span>
          <span className="podcast-soundcloud-link__label">
            {articleMedia.listenOnSoundCloud}
          </span>
          <ExternalArrow className="podcast-soundcloud-link__arrow" />
        </a>
      ) : null}
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

const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;

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
  autoPlay = false,
  resumeId,
}: PodcastAudioPlayerProps & { url: string }) {
  const persist = useArticleListen();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onProgressRef = useRef(onPlaybackProgress);
  onProgressRef.current = onPlaybackProgress;
  const resumeIdRef = useRef(resumeId);
  resumeIdRef.current = resumeId;
  const lastWriteRef = useRef(0);
  const resumeAtRef = useRef(resumeId != null ? readPlaybackPosition(resumeId) : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [starting, setStarting] = useState(autoPlay);
  const startingRef = useRef(autoPlay);
  startingRef.current = starting;
  const [currentTime, setCurrentTime] = useState(() => resumeAtRef.current);
  const [durationSeconds, setDurationSeconds] = useState(
    () => duration ?? estimateDurationFromSeed(seed),
  );
  const [durationKnown, setDurationKnown] = useState(
    () => duration != null && duration > 0,
  );
  const [playbackRate, setPlaybackRate] = useState(1);
  const [muted, setMuted] = useState(false);

  const remember = (seconds: number, force = false) => {
    const id = resumeIdRef.current;
    if (id == null) return;
    const now = Date.now();
    if (!force && now - lastWriteRef.current < 1000) return;
    lastWriteRef.current = now;
    writePlaybackPosition(id, seconds);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const saved = resumeId != null ? readPlaybackPosition(resumeId) : 0;
    resumeAtRef.current = saved;
    setCurrentTime(saved);
    setDurationKnown(duration != null && duration > 0);
    if (autoPlay) setStarting(true);

    const applyResume = () => {
      const at = resumeAtRef.current;
      if (at < 1) return;
      const max =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : at;
      if (at >= max - 0.4) return;
      if (Math.abs(audio.currentTime - at) < 0.35) return;
      audio.currentTime = at;
      setCurrentTime(at);
    };

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDurationSeconds(audio.duration);
        setDurationKnown(true);
      }
      applyResume();
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
      remember(audio.currentTime);
      emit({ currentTime: audio.currentTime });
    };

    const onPlay = () => {
      startingRef.current = false;
      setStarting(false);
      setIsPlaying(true);
      emit({ currentTime: audio.currentTime, isPlaying: true });
    };
    const onPause = () => {
      if (startingRef.current) return;
      setIsPlaying(false);
      remember(audio.currentTime, true);
      emit({ currentTime: audio.currentTime, isPlaying: false });
    };
    const onEnded = () => {
      setStarting(false);
      setIsPlaying(false);
      if (resumeIdRef.current != null) clearPlaybackPosition(resumeIdRef.current);
      resumeAtRef.current = 0;
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
    if (autoPlay) {
      void audio.play().catch(() => {
        setStarting(false);
      });
    }

    return () => {
      remember(audio.currentTime, true);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("canplay", syncDuration);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [url, autoPlay, resumeId, duration]);

  useEffect(() => {
    if (duration != null && duration > 0) {
      setDurationSeconds(duration);
      setDurationKnown(true);
    }
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
    audio.muted = muted;
  }, [playbackRate, muted, url]);

  const bindEngine = persist?.bindEngine;
  useEffect(() => {
    if (variant !== "dock" || !bindEngine) return;
    const audio = audioRef.current;
    if (!audio) return;
    return bindEngine({
      toggle: () => {
        if (startingRef.current) return;
        if (!audio.paused) audio.pause();
        else void audio.play().catch(() => undefined);
      },
      pause: () => audio.pause(),
    });
  }, [variant, bindEngine, url]);

  const handlePlay = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const audio = audioRef.current;
    if (!audio || starting) return;

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
    resumeAtRef.current = audio.currentTime;
    remember(audio.currentTime, true);
  };

  const handleSeekEnd = () => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio.play().catch(() => {
      /* blocked or missing source */
    });
  };

  const pausePlayback = () => {
    audioRef.current?.pause();
  };

  const skipBy = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : durationSeconds;
    const next = Math.min(Math.max(0, audio.currentTime + delta), Math.max(0, max));
    audio.currentTime = next;
    setCurrentTime(next);
    resumeAtRef.current = next;
    remember(next, true);
  };

  const cycleRate = () => {
    setPlaybackRate((current) => {
      const index = PLAYBACK_RATES.indexOf(
        current as (typeof PLAYBACK_RATES)[number],
      );
      return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
    });
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
      durationKnown={durationKnown}
      playbackRate={playbackRate}
      muted={muted}
      playPending={starting && !isPlaying}
      onPlayClick={handlePlay}
      onSeek={variant === "cover" ? undefined : handleSeek}
      onSeekEnd={variant === "cover" ? undefined : handleSeekEnd}
      onSkip={skipBy}
      onCycleRate={cycleRate}
      onToggleMute={() => setMuted((value) => !value)}
      onPause={pausePlayback}
      hiddenBridge={
        <audio
          ref={audioRef}
          src={url}
          preload="auto"
          playsInline
          className="podcast-player__audio-bridge"
        />
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
  showSourceLink = false,
  autoPlay = false,
  resumeId,
}: PodcastAudioPlayerProps & { pageUrl: string }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const onProgressRef = useRef(onPlaybackProgress);
  onProgressRef.current = onPlaybackProgress;
  const widgetRef = useRef<ReturnType<typeof createSoundCloudWidget> | null>(
    null,
  );
  const resumeIdRef = useRef(resumeId);
  resumeIdRef.current = resumeId;
  const lastWriteRef = useRef(0);
  const resumeAtRef = useRef(resumeId != null ? readPlaybackPosition(resumeId) : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => resumeAtRef.current);
  const [durationSeconds, setDurationSeconds] = useState(
    () => duration ?? estimateDurationFromSeed(seed),
  );
  const [durationKnown, setDurationKnown] = useState(
    () => duration != null && duration > 0,
  );
  const isPlayingRef = useRef(false);
  const pendingPlayRef = useRef(autoPlay);
  const [widgetArmed, setWidgetArmed] = useState(autoPlay);
  const [starting, setStarting] = useState(autoPlay);
  isPlayingRef.current = isPlaying;

  const widgetSrc = buildSoundCloudWidgetUrl(pageUrl);

  useEffect(() => {
    if (!widgetArmed) return;

    let cancelled = false;

    const saved = resumeId != null ? readPlaybackPosition(resumeId) : 0;
    resumeAtRef.current = saved;
    setIsPlaying(false);
    setCurrentTime(saved);
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
            if (ms > 0) {
              setDurationSeconds(ms / 1000);
              setDurationKnown(true);
            }
          });
          const savedMs = resumeAtRef.current * 1000;
          if (savedMs >= 1000) {
            widget.seekTo(savedMs);
            setCurrentTime(resumeAtRef.current);
          }
          if (pendingPlayRef.current) {
            widget.play();
          }
        });

        widget.bind(Events.PLAY, () => {
          if (cancelled) return;
          pendingPlayRef.current = false;
          setStarting(false);
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
          if (pendingPlayRef.current) return;
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
          const id = resumeIdRef.current;
          if (id != null) {
            const now = Date.now();
            if (now - lastWriteRef.current >= 1000) {
              lastWriteRef.current = now;
              writePlaybackPosition(id, nextTime);
            }
          }
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
          setStarting(false);
          setIsPlaying(false);
          if (resumeIdRef.current != null) clearPlaybackPosition(resumeIdRef.current);
          resumeAtRef.current = 0;
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
        /* widget script unavailable */
      });

    return () => {
      cancelled = true;
      widgetRef.current = null;
    };
  }, [pageUrl, widgetSrc, widgetArmed, resumeId]);

  useEffect(() => {
    if (duration != null && duration > 0) {
      setDurationSeconds(duration);
      setDurationKnown(true);
    }
  }, [duration]);

  const handlePlay = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (starting) return;
    const widget = widgetRef.current;
    if (!widget) {
      pendingPlayRef.current = true;
      setStarting(true);
      setWidgetArmed(true);
      return;
    }
    if (isPlayingRef.current) {
      pendingPlayRef.current = false;
      widget.pause();
      return;
    }
    pendingPlayRef.current = true;
    setStarting(true);
    widget.play();
  };

  const handleSeek = (ratio: number) => {
    const widget = widgetRef.current;
    if (!widget || durationSeconds <= 0) return;
    const nextTime = ratio * durationSeconds;
    widget.seekTo(nextTime * 1000);
    setCurrentTime(nextTime);
    resumeAtRef.current = nextTime;
    if (resumeIdRef.current != null) {
      writePlaybackPosition(resumeIdRef.current, nextTime);
    }
  };

  const handleSeekEnd = () => {
    const widget = widgetRef.current;
    if (!widget) return;
    pendingPlayRef.current = true;
    widget.play();
  };

  const pausePlayback = () => {
    const widget = widgetRef.current;
    if (!widget) return;
    pendingPlayRef.current = false;
    widget.pause();
  };

  const skipBy = (delta: number) => {
    const widget = widgetRef.current;
    if (!widget || durationSeconds <= 0) return;
    const next = Math.min(Math.max(0, currentTime + delta), durationSeconds);
    widget.seekTo(next * 1000);
    setCurrentTime(next);
    resumeAtRef.current = next;
    if (resumeIdRef.current != null) writePlaybackPosition(resumeIdRef.current, next);
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
      durationKnown={durationKnown}
      playPending={starting && !isPlaying}
      onPlayClick={handlePlay}
      onSeek={variant === "cover" ? undefined : handleSeek}
      onSeekEnd={variant === "cover" ? undefined : handleSeekEnd}
      onSkip={skipBy}
      onPause={pausePlayback}
      sourceUrl={showSourceLink ? pageUrl : null}
      hiddenBridge={
        widgetArmed ? (
          <iframe
            key={widgetSrc}
            ref={iframeRef}
            title=""
            src={widgetSrc}
            className="podcast-player__soundcloud-bridge"
            allow="autoplay"
          />
        ) : null
      }
    />
  );
}

function PodcastAudioPlayerPending({
  seed,
  duration,
  variant = "inline",
  className,
  title,
  subtitle,
  coverUrl,
  onNeedSource,
  sourcePending = false,
}: PodcastAudioPlayerProps) {
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
      durationSeconds={duration ?? estimateDurationFromSeed(seed)}
      playPending={sourcePending}
      onPlayClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!sourcePending) onNeedSource?.();
      }}
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
  showSourceLink = false,
  autoPlay = false,
  onNeedSource,
  sourcePending = false,
  resumeId,
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
        showSourceLink={showSourceLink}
        autoPlay={autoPlay}
        resumeId={resumeId}
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
        autoPlay={autoPlay}
        resumeId={resumeId}
      />
    );
  }

  if (interactive && onNeedSource) {
    return (
      <PodcastAudioPlayerPending
        seed={seed}
        duration={duration}
        variant={variant}
        className={className}
        title={title}
        subtitle={subtitle}
        coverUrl={coverUrl}
        onNeedSource={onNeedSource}
        sourcePending={sourcePending}
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
