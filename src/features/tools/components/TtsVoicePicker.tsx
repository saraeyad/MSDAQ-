import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiOrigin } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TtsVoice } from "@/types";
import { useEffect, useRef, useState } from "react";

/** Play a voice sample. Absolute staging URLs stay on that host; in local dev, `/voice-samples` goes through the Vite proxy. */
export function resolveTtsSampleUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (import.meta.env.DEV && !import.meta.env.VITE_HOST_API) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.pathname.startsWith("/voice-samples")) {
          return `${parsed.pathname}${parsed.search}`;
        }
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (import.meta.env.DEV && !import.meta.env.VITE_HOST_API) return path;
  return `${apiOrigin()}${path}`;
}

function rampVolume(
  audio: HTMLAudioElement,
  to: number,
  ms: number,
  frame: { id: number },
): Promise<void> {
  cancelAnimationFrame(frame.id);
  const from = audio.volume;
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - (1 - t) ** 3;
      audio.volume = from + (to - from) * eased;
      if (t < 1) {
        frame.id = requestAnimationFrame(tick);
        return;
      }
      resolve();
    };
    frame.id = requestAnimationFrame(tick);
  });
}

export function TtsVoicePicker({
  voices,
  value,
  onValueChange,
  disabled = false,
  placeholder = "اختر صوتاً",
  className,
}: {
  voices: TtsVoice[];
  value: string;
  onValueChange: (slug: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrame = useRef({ id: 0 });
  const playToken = useRef(0);
  const [playingSlug, setPlayingSlug] = useState<string | null>(null);

  useEffect(() => {
    const frame = fadeFrame.current;
    const audio = audioRef.current;
    return () => {
      cancelAnimationFrame(frame.id);
      audio?.pause();
    };
  }, []);

  const playSample = (slug: string) => {
    const src = resolveTtsSampleUrl(
      voices.find((voice) => voice.slug === slug)?.sample_url,
    );
    const audio = audioRef.current;
    if (!audio || !src || disabled) return;

    const token = ++playToken.current;

    void (async () => {
      if (!audio.paused) {
        await rampVolume(audio, 0, 140, fadeFrame.current);
        if (token !== playToken.current) return;
        audio.pause();
      }

      audio.src = src;
      audio.volume = 0;
      audio.currentTime = 0;

      try {
        await audio.play();
      } catch {
        if (token === playToken.current) setPlayingSlug(null);
        return;
      }

      if (token !== playToken.current) return;
      setPlayingSlug(slug);
      await rampVolume(audio, 0.92, 280, fadeFrame.current);
    })();
  };

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlayingSlug(null)}
      />
      <Select
        value={value || undefined}
        onValueChange={(slug) => {
          onValueChange(slug);
          playSample(slug);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "tts-voice-picker__trigger w-full min-w-48 sm:max-w-md",
            playingSlug && "tts-voice-picker__trigger--live",
            className,
          )}
        >
          {playingSlug ? (
            <span className="tts-voice-eq" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          ) : null}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem key={voice.slug} value={voice.slug}>
              {voice.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
