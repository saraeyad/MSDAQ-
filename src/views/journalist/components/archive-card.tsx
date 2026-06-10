import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/router/routes";
import type { JournalistArticle } from "@/types/journalist-article";
import ArticleCoverImage from "@/views/articles/components/article-cover-image";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const STATUS_VARIANTS = {
  draft: "secondary",
  pending: "outline",
  published: "default",
  rejected: "destructive",
} as const;

interface ArchiveCardProps {
  article: JournalistArticle;
}

export default function ArchiveCard({ article }: ArchiveCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-4">
        <ArticleCoverImage
          src={article.coverImage}
          alt={article.title}
          aspect="thumb"
          className="rounded-md border border-border/60"
          loading="lazy"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="font-headline text-base leading-snug">
                {article.title}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("journalist.archive.updated", {
                  date: new Date(article.updatedAt).toLocaleDateString(),
                })}
              </p>
            </div>
            <Badge variant={STATUS_VARIANTS[article.status]} className="shrink-0">
              {t(`journalist.archive.status.${article.status}`)}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{article.content}</p>
          {article.trustScore !== null || article.fushaPassed != null ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {article.trustScore !== null ? (
                <Badge variant="secondary">
                  {t("scores.trust")}: {article.trustScore}
                </Badge>
              ) : null}
              {article.fushaPassed != null ? (
                <Badge variant={article.fushaPassed ? "success" : "destructive"}>
                  {article.fushaPassed
                    ? t("journalist.editor.fushaOk")
                    : t("journalist.editor.fushaRequired")}
                </Badge>
              ) : null}
              {article.credibilityScore !== null ? (
                <Badge variant="outline">
                  {t("scores.credibility")}: {article.credibilityScore}
                </Badge>
              ) : null}
            </div>
          ) : null}
          {article.rejectionReason ? (
            <p className="text-xs text-destructive">{article.rejectionReason}</p>
          ) : null}
          <div className="flex gap-2">
            {article.status === "published" ? (
              <Button size="sm" variant="outline" asChild>
                <Link to={`${ROUTES.JOURNALIST_EDITOR}?id=${article.id}`}>
                  {t("journalist.archive.view")}
                </Link>
              </Button>
            ) : null}
            {article.status === "draft" || article.status === "rejected" ? (
              <Button size="sm" variant="outline" asChild>
                <Link to={`${ROUTES.JOURNALIST_EDITOR}?id=${article.id}`}>
                  {t("journalist.archive.edit")}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
