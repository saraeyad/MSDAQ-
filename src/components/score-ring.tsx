import { getTrustLevel, TRUST_STROKE_CLASS, TRUST_TEXT_CLASS } from "@/lib/trust-level";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type ScoreRingSize = "sm" | "md" | "lg" | "xl";

const SIZE_CONFIG: Record<
  ScoreRingSize,
  { px: number; stroke: number; scoreClass: string; labelClass: string }
> = {
  sm: { px: 48, stroke: 4, scoreClass: "text-xs font-bold", labelClass: "text-[8px]" },
  md: { px: 72, stroke: 5, scoreClass: "text-lg font-bold", labelClass: "text-[9px]" },
  lg: { px: 120, stroke: 7, scoreClass: "text-3xl font-bold", labelClass: "text-[10px]" },
  xl: { px: 160, stroke: 9, scoreClass: "text-5xl font-bold", labelClass: "text-xs" },
};

export interface ScoreRingProps {
  score: number;
  size?: ScoreRingSize;
  label?: string;
  animated?: boolean;
  max?: number;
  className?: string;
}

export default function ScoreRing({
  score,
  size = "md",
  label,
  animated = false,
  max = 100,
  className,
}: ScoreRingProps) {
  const [mounted, setMounted] = useState(!animated);
  const config = SIZE_CONFIG[size];
  const level = getTrustLevel(score);
  const normalized = Math.min(Math.max(score, 0), max);
  const percent = (normalized / max) * 100;

  const radius = (config.px - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  useEffect(() => {
    if (!animated) return;
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, [animated]);

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: config.px, height: config.px }}
      role="img"
      aria-label={label ? `${score} — ${label}` : `${score}`}
    >
      <svg
        width={config.px}
        height={config.px}
        viewBox={`0 0 ${config.px} ${config.px}`}
        className="-rotate-90"
      >
        <circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={config.stroke}
        />
        <circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          className={cn(TRUST_STROKE_CLASS[level], "transition-[stroke-dashoffset] duration-1000 ease-out")}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={cn(
            "font-headline leading-none",
            config.scoreClass,
            TRUST_TEXT_CLASS[level],
          )}
        >
          {Math.round(score)}
        </span>
        {label ? (
          <span
            className={cn(
              "mt-0.5 max-w-[80%] font-medium uppercase leading-tight tracking-wide text-muted-foreground",
              config.labelClass,
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
