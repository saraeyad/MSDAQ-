import { generateWaveformHeights } from "@/lib/waveform";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function WaveformBars({
  seed,
  barCount = 72,
  className,
  progress = 0,
}: {
  seed: number | string;
  barCount?: number;
  className?: string;
  progress?: number;
}) {
  const bars = useMemo(
    () => generateWaveformHeights(seed, barCount),
    [barCount, seed],
  );

  return (
    <div className={cn("waveform-bars", className)} aria-hidden="true">
      {bars.map((height, index) => {
        const filled = index / bars.length <= progress;
        return (
          <span
            key={index}
            className={cn(
              "waveform-bars__bar",
              filled && "waveform-bars__bar--played",
            )}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}
