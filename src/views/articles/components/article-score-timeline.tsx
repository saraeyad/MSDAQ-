import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ScoreHistoryEntry } from "@/types/article";
import { useTranslation } from "react-i18next";

interface ArticleScoreTimelineProps {
  history: ScoreHistoryEntry[];
}

export default function ArticleScoreTimeline({ history }: ArticleScoreTimelineProps) {
  const { t } = useTranslation();

  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="space-y-6">
      <h2 className="text-headline-sm">{t("articles.scoreEvolution")}</h2>

      <div className="relative space-y-4 border-s border-border ps-6">
        {sorted.map((entry, index) => (
          <div key={entry.id} className="relative">
            <span
              className={cn(
                "absolute -start-[1.6rem] top-6 size-3 rounded-full border-2 border-card",
                index === 0 ? "bg-secondary" : "bg-muted-foreground/40"
              )}
            />
            <Card>
              <CardContent className="flex gap-5 p-5">
                <div
                  className={cn(
                    "shrink-0 font-headline text-3xl font-semibold",
                    index === 0 ? "text-secondary" : "text-muted-foreground"
                  )}
                >
                  {entry.trustScore}%
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-foreground">
                    {entry.statusLabel ?? entry.note} — {entry.date}
                  </p>
                  <p className="text-body-md text-muted-foreground">
                    {entry.description ?? entry.note}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
