import PageWrapper from "@/components/page-wrapper";
import SectionTitle from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/router/routes";
import JournalistArticles_APIs from "@/services/api/journalist-articles";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import RejectArticleDialog from "../../components/reject-article-dialog";
import useAdminArticleActions from "../../hooks/use-admin-article-actions";

export default function AdminArticleDetail() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const { approve, reject, isApproving, isRejecting } = useAdminArticleActions(id);

  const { data: article, isLoading } = useQuery({
    queryKey: ["admin-article", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await JournalistArticles_APIs.getByIdForAdmin(id);
      if (response.data.error || !response.data.data) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
  });

  const handleReject = (reason?: string) => {
    reject(reason, {
      onSuccess: () => {
        setRejectOpen(false);
        navigate(ROUTES.ADMIN_ARTICLES);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) return null;

  return (
    <PageWrapper
      breadcrumbsItems={[
        { name: t("MENU.ADMIN_DASHBOARD"), path: ROUTES.ADMIN_DASHBOARD },
        { name: t("MENU.ARTICLE_REVIEW"), path: ROUTES.ADMIN_ARTICLES },
        { name: article.title },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionTitle>{article.title}</SectionTitle>
          <Badge>{t("admin.articleReview.pending")}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {article.trustScore !== null ? (
            <Badge variant="secondary">{t("scores.trust")}: {article.trustScore}</Badge>
          ) : null}
          {article.credibilityScore !== null ? (
            <Badge variant="outline">
              {t("scores.credibility")}: {article.credibilityScore}
            </Badge>
          ) : null}
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="whitespace-pre-wrap leading-8">{article.content}</p>
          </CardContent>
        </Card>

        {article.sources.length > 0 ? (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <h3 className="font-semibold">{t("articles.sourcesTitle")}</h3>
              {article.sources.map((source) => (
                <div key={source.id} className="rounded border p-3 text-sm">
                  <p className="font-medium">{source.label}</p>
                  <p className="text-muted-foreground">
                    {t(`articles.sourceType.${source.type}`)}
                    {source.url ? ` — ${source.url}` : ""}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => approve()} disabled={isApproving || isRejecting}>
            {isApproving ? <Loader className="size-4 animate-spin" /> : null}
            {t("BTN.APPROVE")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setRejectOpen(true)}
            disabled={isApproving || isRejecting}
          >
            {t("BTN.REJECT")}
          </Button>
        </div>
      </div>

      <RejectArticleDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        loading={isRejecting}
      />
    </PageWrapper>
  );
}
