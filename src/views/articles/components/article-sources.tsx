import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArticleSource } from "@/types/article";
import { ExternalLink, FileText, User, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

const SOURCE_ICONS = {
  url: ExternalLink,
  document: FileText,
  person: User,
  anonymous: EyeOff,
};

interface ArticleSourcesProps {
  sources: ArticleSource[];
}

export default function ArticleSources({ sources }: ArticleSourcesProps) {
  const { t } = useTranslation();

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="font-headline text-base">{t("articles.sourcesTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sources.map((source) => {
          const Icon = SOURCE_ICONS[source.type];
          return (
            <div
              key={source.id}
              className="flex items-start justify-between gap-3 border border-border p-3"
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 text-foreground/70" />
                <div>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground hover:underline"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <p className="font-medium">{source.label}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t(`articles.sourceType.${source.type}`)}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{t(`articles.sourceType.${source.type}`)}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
