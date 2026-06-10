import TrustBadge from "@/components/trust-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ArticleScoresProps {
  trustScore: number;
  credibilityScore: number;
}

export default function ArticleScores({
  trustScore,
  credibilityScore,
}: ArticleScoresProps) {
  const { t } = useTranslation();
  const trustPassed = trustScore >= 65;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("articles.scoresTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-md font-medium">
              {t("scores.trust")}
            </span>
            {trustPassed ? (
              <ShieldCheck className="size-5 text-trust-high" />
            ) : (
              <ShieldAlert className="size-5 text-trust-low" />
            )}
          </div>
          <p className="mt-2 font-headline text-4xl font-semibold">
            {trustScore}
          </p>
          <div className="mt-3">
            <TrustBadge score={trustScore} label={t("scores.trust")} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {trustPassed
              ? t("articles.trustPassed")
              : t("articles.trustBlocked")}
          </p>
        </div>

        <div className="rounded border border-border bg-muted/40 p-4">
          <span className="text-body-md font-medium">
            {t("scores.credibility")}
          </span>
          <p className="mt-2 font-headline text-4xl font-semibold">
            {credibilityScore}
          </p>
          <div className="mt-3">
            <TrustBadge
              score={credibilityScore}
              label={t("scores.credibility")}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("articles.credibilityInfo")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
