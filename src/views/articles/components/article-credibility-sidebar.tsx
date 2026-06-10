import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import type { Article } from "@/types/article";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ArticleCredibilitySidebarProps {
  article: Article;
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-muted">
        <div
          className="h-full rounded-sm bg-secondary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ArticleCredibilitySidebar({
  article,
}: ArticleCredibilitySidebarProps) {
  const { t } = useTranslation();

  const credibilityScore = article.credibilityScore;
  const breakdown =
    article.credibilityBreakdown ??
    (credibilityScore != null
      ? {
          sourceAccuracy: Math.min(credibilityScore + 6, 100),
          reportNeutrality: Math.max(credibilityScore - 7, 0),
          dataVerification: credibilityScore,
        }
      : undefined);

  if (credibilityScore == null && !breakdown) {
    return null;
  }

  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden">
        {credibilityScore != null ? (
          <Badge className="absolute start-4 top-4 rounded px-2 py-1 text-sm font-semibold">
            {credibilityScore}/100
          </Badge>
        ) : null}
        <CardHeader className="pt-14">
          <CardTitle>{t("articles.credibilityAnalysis")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {breakdown ? (
            <>
              <ProgressBar
                label={t("articles.sourceAccuracy")}
                value={breakdown.sourceAccuracy}
              />
              <ProgressBar
                label={t("articles.reportNeutrality")}
                value={breakdown.reportNeutrality}
              />
              <ProgressBar
                label={t("articles.dataVerification")}
                value={breakdown.dataVerification}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      {article.quickVerification?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("articles.quickVerification")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {article.quickVerification.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 text-body-md"
              >
                {item.status === "verified" ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-trust-high" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-trust-medium" />
                )}
                <span className="text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {article.relatedArticles?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("articles.relatedInvestigations")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {article.relatedArticles.map((related) => (
              <div key={related.id} className="space-y-1">
                <Link
                  to={ROUTES.ARTICLE(related.id)}
                  className="text-body-md font-medium text-foreground hover:text-secondary"
                >
                  {related.title}
                </Link>
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    related.credibilityLevel === "high" && "text-trust-high",
                    related.credibilityLevel === "medium" &&
                      "text-trust-medium",
                    related.credibilityLevel === "low" && "text-trust-low",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {t(`articles.credibilityLevel.${related.credibilityLevel}`)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
