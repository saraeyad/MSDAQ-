function numericSeed(seed: number | string): number {
  return typeof seed === "number"
    ? seed
    : String(seed)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

/** ارتفاعات ثابتة للموجات — مُشتقة من معرّف المقال */
export function generateWaveformHeights(
  seed: number | string,
  barCount = 56,
): number[] {
  const base = numericSeed(seed);

  return Array.from({ length: barCount }, (_, index) => {
    const wave =
      Math.sin(base * 0.31 + index * 0.55) * 0.5 +
      Math.sin(base * 0.17 + index * 1.2) * 0.3 +
      Math.cos(index * 0.9 + base * 0.08) * 0.2;
    const normalized = (wave + 1) / 2;
    return 18 + normalized * 82;
  });
}

/** بيانات peaks لـ wavesurfer.js (قيم بين -1 و 1) */
export function generateWaveformPeaks(
  seed: number | string,
  sampleCount = 200,
): number[][] {
  const base = numericSeed(seed);

  const channel = Array.from({ length: sampleCount }, (_, index) => {
    const wave =
      Math.sin(base * 0.31 + index * 0.55) * 0.55 +
      Math.sin(base * 0.17 + index * 1.2) * 0.28 +
      Math.cos(index * 0.9 + base * 0.08) * 0.17;
    return Math.max(-1, Math.min(1, wave));
  });

  return [channel];
}

export function estimateDurationFromSeed(seed: number | string): number {
  const base = numericSeed(seed);
  return 90 + (base % 420);
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
