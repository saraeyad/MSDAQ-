import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArticleTimelineEvent } from "@/types/article";
import { useTranslation } from "react-i18next";

interface ArticleTimelineProps {
  events: ArticleTimelineEvent[];
}

export default function ArticleTimeline({ events }: ArticleTimelineProps) {
  const { t } = useTranslation();

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="font-headline text-base">{t("articles.timelineTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-s border-border ps-4">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -start-[21px] top-1.5 size-2.5 rounded-full bg-primary" />
              <p className="text-xs text-muted-foreground">{event.date}</p>
              <p className="font-medium">{event.label}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
