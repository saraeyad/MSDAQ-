import ScoreRing from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SmartEditorTool } from "@/services/api/smart-editor";
import { PUBLISH_TRUST_THRESHOLD } from "@/services/types/journalist-articles";
import type {
  PublishReadiness,
  StandardsBreakdownItem,
  StandardsCheckResult,
} from "@/types/journalist-article";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, ShieldCheck, Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const CRITERION_MAX_SCORE = 20;
const LOW_BIAS_SCORE_THRESHOLD = 15;

function getSuggestedToolForCriterion(
  item: StandardsBreakdownItem,
): SmartEditorTool | null {
  if (item.key === "fusha_language" && item.passed === false) {
    return "rewrite-fusha";
  }
  if (
    item.key === "no_bias" &&
    item.score !== undefined &&
    item.score < LOW_BIAS_SCORE_THRESHOLD
  ) {
    return "neutralize-bias";
  }
  return null;
}

function getCriterionRingScore(item: StandardsBreakdownItem): number | null {
  if (item.score !== undefined) {
    return Math.round((item.score / CRITERION_MAX_SCORE) * 100);
  }
  if (item.passed !== undefined) {
    return item.passed ? 100 : 0;
  }
  return null;
}

interface StandardsCheckPanelProps {
  result: StandardsCheckResult | null;
  loading?: boolean;
  title?: string;
  scoreLabel?: string;
  hidePublishBadge?: boolean;
  hideScoreRing?: boolean;
  criterionLabel?: (key: string) => string;
  publishReadiness?: PublishReadiness | null;
  onSuggestTool?: (tool: SmartEditorTool) => void;
}

export default function StandardsCheckPanel({
  result,
  loading,
  title,
  scoreLabel,
  hidePublishBadge = false,
  hideScoreRing = false,
  criterionLabel,
  publishReadiness,
  onSuggestTool,
}: StandardsCheckPanelProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center font-headline text-sm text-muted-foreground">
          {t("journalist.editor.checking")}
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="py-8 text-center font-headline text-sm text-muted-foreground">
          {t("journalist.editor.checkHint")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-base">
          <ShieldCheck className="size-5" />
          {title ?? t("journalist.editor.standardsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hideScoreRing ? (
          <div className="space-y-2 border border-border p-4">
            <div className="flex justify-center">
              <ScoreRing
                score={result.trustScore}
                size="lg"
                label={scoreLabel ?? t("scores.trust")}
                animated
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {t("journalist.editor.trustScoreMinimum", {
                threshold: PUBLISH_TRUST_THRESHOLD,
              })}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Badge variant={result.fushaCompliant ? "default" : "destructive"}>
            {result.fushaCompliant
              ? t("journalist.editor.fushaOk")
              : t("journalist.editor.fushaRequired")}
          </Badge>
          {!hidePublishBadge ? (
            <Badge variant={result.canPublish ? "default" : "secondary"}>
              {result.canPublish
                ? t("journalist.editor.canPublish")
                : t("journalist.editor.cannotPublish")}
            </Badge>
          ) : null}
        </div>

        {result.breakdown.length > 0 ? (
          <ul className="space-y-3">
            {result.breakdown.map((item) => {
              const ringScore = getCriterionRingScore(item);
              const suggestedTool = getSuggestedToolForCriterion(item);

              return (
                <li key={item.key} className="border border-border p-3 text-sm">
                  <div className="flex items-start gap-3">
                    {ringScore !== null ? (
                      <ScoreRing score={ringScore} size="sm" animated />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {criterionLabel ? criterionLabel(item.key) : item.label}
                        </span>
                        {item.passed !== undefined ? (
                          <Badge variant={item.passed ? "success" : "destructive"}>
                            {item.passed
                              ? t("journalist.editor.passed")
                              : t("journalist.editor.failed")}
                          </Badge>
                        ) : null}
                        {item.score !== undefined ? (
                          <span className="font-semibold">
                            {item.score}/{CRITERION_MAX_SCORE}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-muted-foreground">{item.feedback}</p>
                      {onSuggestTool && suggestedTool ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-2 h-8 gap-1.5 border-accent-editor/20 px-2.5 text-accent-editor hover:border-accent-editor/30 hover:bg-accent-editor/5 hover:text-accent-editor"
                          onClick={() => onSuggestTool(suggestedTool)}
                        >
                          <Wand2 className="size-3.5" />
                          {t("journalist.smartEditor.fixWithAI")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {result.issues.length > 0 ? (
          <ul className="space-y-1 text-sm text-destructive">
            {result.issues.map((issue) => (
              <li key={issue} className="flex items-center gap-2">
                <AlertTriangle className="size-3.5" />
                {t(`journalist.editor.issues.${issue}`)}
              </li>
            ))}
          </ul>
        ) : publishReadiness && !publishReadiness.canPublish ? (
          <p className="flex items-start gap-2 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {t("journalist.editor.standardsPassedMoreRequired")}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="size-4" />
            {t("journalist.editor.allPassed")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
