import { cn } from "@/lib/utils";

export type ScoreTone = "auto" | "success" | "warning" | "danger";

export function toneFromAiVerdict(
  verdict: string,
): Exclude<ScoreTone, "auto"> {
  if (verdict === "likely_real") return "success";
  if (verdict === "ai_generated") return "danger";
  return "warning";
}

export function labelFromAiVerdict(verdict: string): string {
  if (verdict === "ai_generated") return "علامات توليد بالذكاء الاصطناعي";
  if (verdict === "likely_real") return "يبدو حقيقياً";
  return "غير مؤكد";
}

interface ScoreDonutProps {
  value: number;
  max?: number;
  label: string;
  caption?: string;
  format?: "number" | "percent";
  tone?: ScoreTone;
  size?: "sm" | "md";
  className?: string;
}

function toneFromPercent(percent: number): Exclude<ScoreTone, "auto"> {
  if (percent >= 70) return "success";
  if (percent >= 40) return "warning";
  return "danger";
}

const TONE_COLOR: Record<Exclude<ScoreTone, "auto">, string> = {
  success: "#16a34a",
  warning: "#f98c34",
  danger: "#dc2626",
};

export function ScoreDonut({
  value,
  max = 100,
  label,
  caption,
  format = "number",
  tone = "auto",
  size = "sm",
  className,
}: ScoreDonutProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(safeMax, Math.max(0, Number.isFinite(value) ? value : 0));
  const percent = (clamped / safeMax) * 100;
  const resolvedTone = tone === "auto" ? toneFromPercent(percent) : tone;
  const color = TONE_COLOR[resolvedTone];
  const dim = size === "md" ? 88 : 72;
  const stroke = size === "md" ? 8 : 6.5;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;
  const display =
    format === "percent"
      ? `${Math.round(percent)}%`
      : Number.isInteger(clamped)
        ? String(clamped)
        : clamped.toFixed(1);

  const ariaText = caption
    ? `${label}: ${display}، ${caption}`
    : `${label}: ${display}`;

  return (
    <div
      className={cn("score-donut", `score-donut--${size}`, className)}
      role="img"
      aria-label={ariaText}
    >
      <div
        className="score-donut__ring"
        style={{ width: dim, height: dim }}
        aria-hidden
      >
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#eeeae4"
            strokeWidth={stroke}
          />
          {percent > 0 ? (
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            />
          ) : null}
        </svg>
        <span className="score-donut__value" style={{ color }}>
          {display}
        </span>
      </div>
      <div className="score-donut__meta">
        <p className="score-donut__label">{label}</p>
        {caption ? <p className="score-donut__caption">{caption}</p> : null}
      </div>
    </div>
  );
}
