import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export type VoiceProcessingVariant = "processing" | "timed_out" | "failed";

interface VoiceProcessingCardProps {
  variant: VoiceProcessingVariant;
  title: string;
  hint: string;
  progressPercent?: number | null;
  progressCaption?: string | null;
  errorMessage?: string | null;
  onRecheck?: () => void;
  rechecking?: boolean;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds} ث`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")} د`;
}

function EqualizerIcon() {
  return (
    <span className="voice-processing__eq" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className="voice-processing__eq-bar"
          style={{ animationDelay: `${index * 0.12}s` }}
        />
      ))}
    </span>
  );
}

export function VoiceProcessingCard({
  variant,
  title,
  hint,
  progressPercent = null,
  progressCaption = null,
  errorMessage = null,
  onRecheck,
  rechecking = false,
}: VoiceProcessingCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const determinate =
    progressPercent != null &&
    Number.isFinite(progressPercent) &&
    progressPercent > 0;
  const clamped = determinate
    ? Math.min(100, Math.max(0, Math.round(progressPercent)))
    : 0;

  useEffect(() => {
    if (variant !== "processing") {
      setElapsed(0);
      return;
    }

    setElapsed(0);
    const timer = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [variant]);

  return (
    <div
      className={cn(
        "voice-processing",
        variant === "timed_out" && "voice-processing--timeout",
        variant === "failed" && "voice-processing--failed",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="voice-processing__row">
        {variant === "processing" ? (
          <EqualizerIcon />
        ) : (
          <span
            className="voice-processing__icon"
            data-variant={variant}
            aria-hidden
          >
            {variant === "timed_out" ? (
              <Clock className="size-5" />
            ) : (
              <AlertCircle className="size-5" />
            )}
          </span>
        )}

        <div className="voice-processing__copy">
          <p className="voice-processing__title">{title}</p>
          <p className="voice-processing__hint">
            {variant === "failed"
              ? errorMessage?.trim() || hint
              : hint}
          </p>
        </div>
      </div>

      {variant === "processing" ? (
        <>
          <div className="voice-processing__bar-row">
            <div
              className="voice-processing__track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={determinate ? clamped : undefined}
              aria-label={title}
            >
              {determinate ? (
                <div
                  className="voice-processing__fill"
                  style={{ width: `${clamped}%` }}
                />
              ) : (
                <div className="voice-processing__fill voice-processing__fill--indeterminate" />
              )}
            </div>
            <span className="voice-processing__metric">
              {determinate ? `${clamped}%` : "…"}
            </span>
          </div>

          <div className="voice-processing__meta">
            {progressCaption ? <span>{progressCaption}</span> : null}
            <span>
              {elapsed >= 30
                ? "لا تزال العملية جارية — يُرجى الانتظار"
                : elapsed > 0
                  ? `الوقت المنقضي: ${formatElapsed(elapsed)}`
                  : "بدء المعالجة…"}
            </span>
          </div>
        </>
      ) : null}

      {variant === "timed_out" && onRecheck ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="voice-processing__action"
          onClick={onRecheck}
          disabled={rechecking}
        >
          {rechecking && <Loader2 className="size-4 animate-spin" />}
          تحقق مرة أخرى
        </Button>
      ) : null}
    </div>
  );
}
