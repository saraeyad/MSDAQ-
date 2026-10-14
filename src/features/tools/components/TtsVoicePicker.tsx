import { Button } from "@/components/ui/button";
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
import { Headphones } from "lucide-react";
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
  locked = false,
  placeholder = "اختر صوتاً",
  className,
}: {
  voices: TtsVoice[];
  value: string;
  onValueChange: (slug: string) => void;
  disabled?: boolean;
  /** Keep the current voice, but still allow playing its sample. */
  locked?: boolean;
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

  const voiceLocked = disabled || locked;
  const selected = voices.find((voice) => voice.slug === value);
  const sampleUrl = resolveTtsSampleUrl(selected?.sample_url);

  const stopSample = async () => {
    const token = ++playToken.current;
    const audio = audioRef.current;
    if (!audio || audio.paused) {
      setPlayingSlug(null);
      return;
    }
    await rampVolume(audio, 0, 140, fadeFrame.current);
    if (token !== playToken.current) return;
    audio.pause();
    setPlayingSlug(null);
  };

  const playSample = () => {
    const audio = audioRef.current;
    if (!audio || !sampleUrl || !value || disabled) return;
    if (playingSlug === value) {
      void stopSample();
      return;
    }

    const token = ++playToken.current;
    void (async () => {
      if (!audio.paused) {
        await rampVolume(audio, 0, 140, fadeFrame.current);
        if (token !== playToken.current) return;
        audio.pause();
      }

      try {
        if (audio.src !== new URL(sampleUrl, window.location.origin).href) {
          audio.src = sampleUrl;
        }
        audio.volume = 0;
        if (audio.readyState > 0) audio.currentTime = 0;
        await audio.play();
      } catch {
        if (token === playToken.current) setPlayingSlug(null);
        return;
      }
      if (token !== playToken.current) return;
      setPlayingSlug(value);
      await rampVolume(audio, 0.92, 280, fadeFrame.current);
    })();
  };

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlayingSlug(null)}
      />
      <Select
        value={value || undefined}
        onValueChange={(next) => {
          if (voiceLocked) return;
          onValueChange(next);
        }}
        disabled={voiceLocked}
        open={locked ? false : undefined}
      >
        <SelectTrigger
          className="tts-voice-picker__trigger w-full min-w-0 flex-1"
          data-locked={locked ? "true" : undefined}
          title={locked ? "لا يمكن تغيير نوع الصوت بعد نشر المقال" : undefined}
        >
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
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-9 shrink-0 rounded-full bg-background px-3.5",
          playingSlug && "border-primary text-primary",
        )}
        disabled={disabled || !sampleUrl}
        aria-pressed={playingSlug === value}
        onClick={playSample}
      >
        <Headphones className="size-4" />
        استمع
      </Button>
    </div>
  );
}
