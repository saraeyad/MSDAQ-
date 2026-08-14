import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  isFushaCriterion,
  isScoredCriterion,
  severityLabel,
} from "@/lib/standards-normalize";
import { quoteExistsLiterally } from "@/lib/standards-highlight";
import { cn } from "@/lib/utils";
import type { StandardsCheckResult, StandardsCriterion } from "@/types";
import { ScoreDonut } from "@/features/tools/components/ScoreDonut";
import { CheckCircle2, XCircle } from "lucide-react";

interface StandardsResultCardProps {
  result: StandardsCheckResult;
  title?: string;
  content?: string;
  className?: string;
}

function PassFailBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <Badge variant="secondary" className="gap-1 bg-success/10 text-success">
      <CheckCircle2 className="size-3" />
      ناجح
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 bg-destructive/10 text-destructive">
      <XCircle className="size-3" />
      راسب
    </Badge>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: "low" | "medium" | "high";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "standards-span-item__severity",
        `standards-span-item__severity--${severity}`,
      )}
    >
      {severityLabel(severity)}
    </Badge>
  );
}

function CriterionSpans({
  criterion,
  sourceText,
}: {
  criterion: StandardsCriterion;
  sourceText: string;
}) {
  if (!criterion.spans?.length) return null;

  return (
    <ul className="standards-span-list">
      {criterion.spans.map((span, index) => {
        const matched = quoteExistsLiterally(sourceText, span.quote);
        return (
          <li key={`${span.quote}-${index}`} className="standards-span-item">
            <div className="standards-span-item__header">
              <SeverityBadge severity={span.severity} />
              {!matched ? (
                <span className="standards-span-item__unmatched">
                  لم يُعثر على النص حرفياً
                </span>
              ) : null}
            </div>
            <blockquote className="standards-span-item__quote">{span.quote}</blockquote>
            {span.reason ? (
              <p className="standards-span-item__reason">{span.reason}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function CriterionRow({
  criterion,
  hasTitle,
  title,
  content,
}: {
  criterion: StandardsCriterion;
  hasTitle: boolean;
  title: string;
  content: string;
}) {
  const sourceText =
    criterion.key === "headline_neutral" ? title : content;

  if (isFushaCriterion(criterion)) {
    return (
      <div className="standards-criterion">
        <div className="standards-criterion__header">
          <span className="standards-criterion__label">{criterion.label}</span>
          {criterion.passed != null ? (
            <PassFailBadge passed={criterion.passed} />
          ) : null}
        </div>
        {criterion.feedback ? (
          <p className="standards-criterion__feedback">{criterion.feedback}</p>
        ) : null}
      </div>
    );
  }

  const headlineSkipped =
    criterion.key === "headline_neutral" && !hasTitle;

  return (
    <div className="standards-criterion">
      <div className="standards-criterion__header">
        <span className="standards-criterion__label">{criterion.label}</span>
        {headlineSkipped ? (
          <span className="standards-criterion__score">غير مُقيَّم — لا عنوان</span>
        ) : isScoredCriterion(criterion) ? (
          <span className="standards-criterion__score">
            {criterion.score}/{criterion.max}
          </span>
        ) : criterion.score != null ? (
          <span className="standards-criterion__score">{criterion.score}</span>
        ) : null}
      </div>
      {criterion.feedback ? (
        <p className="standards-criterion__feedback">{criterion.feedback}</p>
      ) : null}
      <CriterionSpans criterion={criterion} sourceText={sourceText} />
    </div>
  );
}

export function StandardsResultCard({
  result,
  title = "",
  content = "",
  className,
}: StandardsResultCardProps) {
  const hasTitle = title.trim().length > 0;
  const fushaCriterion = result.criteria.find(isFushaCriterion);

  return (
    <Card className={cn("standards-result-card", className)}>
      <CardContent className="space-y-5 p-4">
        <div className="standards-score-summary">
          <div className="score-donut-row">
            <ScoreDonut
              value={result.total_score}
              max={result.max_score}
              format="percent"
              size="md"
              label="الدرجة التحريرية"
              caption={`${result.total_score} / ${result.max_score}`}
            />
            <div className="standards-score-summary__fusha">
              <div className="standards-score-summary__row">
                <span className="standards-score-summary__label">الفصحى</span>
                <PassFailBadge passed={result.fusha_passed} />
              </div>
              {fushaCriterion?.feedback ? (
                <p className="standards-score-summary__note">
                  {fushaCriterion.feedback}
                </p>
              ) : null}
            </div>
          </div>
          {result.max_score === 120 ? (
            <p className="standards-score-summary__note">
              لا يُقيَّم حياد العنوان عند غياب العنوان (120 بدل 140).
            </p>
          ) : null}
        </div>

        {result.criteria.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            لا تفاصيل معايير في الاستجابة.
          </p>
        ) : (
          <div className="standards-criteria-list">
            {result.criteria.map((criterion) => (
              <CriterionRow
                key={criterion.key}
                criterion={criterion}
                hasTitle={hasTitle}
                title={title}
                content={content}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
