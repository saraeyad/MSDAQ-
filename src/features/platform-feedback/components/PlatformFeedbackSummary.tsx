import {
  formatTrustAverage,
  formatTrustPercentage,
  PLATFORM_TRUST_DIMENSIONS,
  TRUST_BAND_LABELS,
  trustBandClass,
  trustBandLabel,
  trustIndexHasData,
} from "@/lib/trust-index-labels";
import type { TrustIndexSummary } from "@/types";

interface PlatformFeedbackSummaryProps {
  summary: TrustIndexSummary | undefined;
  isLoading?: boolean;
}

function ScoreDots({ average }: { average: number | null | undefined }) {
  const filled = average == null || Number.isNaN(average) ? 0 : Math.round(average);

  return (
    <span className="platform-score-dots" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={
            index < filled
              ? "platform-score-dots__dot platform-score-dots__dot--on"
              : "platform-score-dots__dot"
          }
        />
      ))}
    </span>
  );
}

export function PlatformFeedbackSummary({
  summary,
  isLoading = false,
}: PlatformFeedbackSummaryProps) {
  if (isLoading) {
    return (
      <aside className="platform-feedback-scoreboard platform-feedback-scoreboard--loading">
        جاري تحميل الملخص...
      </aside>
    );
  }

  if (!trustIndexHasData(summary)) {
    return (
      <aside className="platform-feedback-scoreboard platform-feedback-scoreboard--empty">
        لا توجد تقييمات كافية في هذه الفترة.
      </aside>
    );
  }

  const data = summary!;

  return (
    <aside className="platform-feedback-scoreboard">
      <p className="platform-feedback-scoreboard__kicker">ملخص التقييم</p>

      <div className={`platform-feedback-scoreboard__overall ${trustBandClass(data.overall.band)}`}>
        <p className="platform-feedback-scoreboard__percent">
          {formatTrustPercentage(data.overall.percentage)}
        </p>
        <p className="platform-feedback-scoreboard__band">
          {trustBandLabel(data.overall.band)}
        </p>
        <p className="platform-feedback-scoreboard__meta">
          متوسط {formatTrustAverage(data.overall.average)} من 5
        </p>
      </div>

      <ul className="platform-feedback-scoreboard__bands">
        {(["high", "medium", "low"] as const).map((band) => (
          <li key={band} className={`platform-feedback-scoreboard__band-item trust-band--${band}`}>
            <span>{TRUST_BAND_LABELS[band]}</span>
            <strong>{data.band_distribution[band]}</strong>
          </li>
        ))}
      </ul>

      <ul className="platform-feedback-scoreboard__dims">
        {PLATFORM_TRUST_DIMENSIONS.map((dimension) => {
          const dimensionSummary =
            data.dimensions[dimension.key as keyof typeof data.dimensions];
          const average = dimensionSummary?.average ?? null;

          return (
            <li key={dimension.key} className="platform-feedback-scoreboard__dim">
              <div className="platform-feedback-scoreboard__dim-head">
                <span>{dimension.label}</span>
                <span className="platform-feedback-scoreboard__dim-avg">
                  {formatTrustAverage(average)}
                </span>
              </div>
              <ScoreDots average={average} />
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
