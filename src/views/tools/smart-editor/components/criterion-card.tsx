import ScoreRing from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StandardsBreakdownItem } from "@/types/journalist-article";
import { useTranslation } from "react-i18next";
import { CRITERION_META, type CriterionKey } from "./standards-criteria-legend";

const CRITERION_MAX_SCORE = 20;

function getCriterionRingScore(item: StandardsBreakdownItem): number | null {
  if (item.score !== undefined) {
    return Math.round((item.score / CRITERION_MAX_SCORE) * 100);
  }
  if (item.passed !== undefined) {
    return item.passed ? 100 : 0;
  }
  return null;
}

interface CriterionCardProps {
  item: StandardsBreakdownItem;
}

export default function CriterionCard({ item }: CriterionCardProps) {
  const { t } = useTranslation();
  const meta = CRITERION_META[item.key as CriterionKey];
  const ringScore = getCriterionRingScore(item);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 border-s-[3px] bg-background/80 p-4",
        meta?.borderClass ?? "border-s-border",
      )}
    >
      <div className="flex items-start gap-3">
        {ringScore !== null ? (
          <ScoreRing score={ringScore} size="sm" animated className="shrink-0" />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">
              {t(`smartEditor.criteria.${item.key}`, { defaultValue: item.label })}
            </span>
            <div className="flex items-center gap-2">
              {item.passed !== undefined ? (
                <Badge variant={item.passed ? "success" : "destructive"}>
                  {item.passed
                    ? t("journalist.editor.passed")
                    : t("journalist.editor.failed")}
                </Badge>
              ) : null}
              {item.score !== undefined ? (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                    item.score >= 14
                      ? "bg-trust-high/10 text-trust-high"
                      : item.score >= 8
                        ? "bg-trust-medium/10 text-trust-medium"
                        : "bg-trust-low/10 text-trust-low",
                  )}
                >
                  {item.score}/{CRITERION_MAX_SCORE}
                </span>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.feedback}
          </p>
        </div>
      </div>
    </div>
  );
}
