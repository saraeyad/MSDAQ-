import DashboardStatCard from "@/components/dashboard-stat-card";
import PageWrapper from "@/components/page-wrapper";
import SectionTitle from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/router/routes";
import JournalistArticles_APIs from "@/services/api/journalist-articles";
import ArticleCoverImage from "@/views/articles/components/article-cover-image";
import useJournalistNotifications from "@/views/journalist/hooks/useJournalistNotifications";
import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  ArrowUpRight,
  Bell,
  FileText,
  Loader,
  PenLine,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function JournalistDashboard() {
  const { t } = useTranslation();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["journalist-articles"],
    queryFn: async () => {
      const response = await JournalistArticles_APIs.list();
      return response.data.data ?? [];
    },
  });

  const { data: notifications } = useJournalistNotifications();

  const stats = {
    drafts: articles?.filter((a) => a.status === "draft").length ?? 0,
    pendingConsent:
      articles?.filter((a) =>
        a.sources?.some(
          (s) => s.consent?.status === "pending" || s.consent?.status === "rejected",
        ),
      ).length ?? 0,
    published: articles?.filter((a) => a.status === "published").length ?? 0,
  };

  const recentDrafts = (articles ?? [])
    .filter((a) => a.status === "draft")
    .slice(0, 4);

  const latestNotification = notifications?.notifications?.[0];
  const unreadCount = notifications?.unread_count ?? 0;

  return (
    <div className="journalist-dashboard-page -mx-4 -mt-6 px-4 pb-8 pt-6 md:-mx-0 md:px-0">
      <PageWrapper breadcrumbsItems={[{ name: t("MENU.JOURNALIST_DASHBOARD") }]}>
        <div className="journalist-dashboard-layout relative z-[1] space-y-6">
          <Card className="journalist-dashboard-hero overflow-hidden border-border/70 shadow-sm">
            <div className="h-1 bg-linear-to-r from-accent-editor via-accent-editor/60 to-accent-editor-secondary" />
            <CardContent className="relative flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
              <div className="journalist-dashboard-hero-glow pointer-events-none absolute -end-8 -top-8 size-40 rounded-full bg-accent-editor/10 blur-3xl" />
              <div className="relative min-w-0 flex-1">
                <p className="text-label-caps text-accent-editor">
                  {t("journalist.dashboard.welcome")}
                </p>
                <SectionTitle className="mt-2">{t("journalist.dashboardTitle")}</SectionTitle>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {t("journalist.dashboard.subtitle")}
                </p>
              </div>
              <div className="relative flex shrink-0 flex-wrap items-center gap-3">
                <Button variant="outline" asChild className="border-accent-editor/20">
                  <Link to={ROUTES.JOURNALIST_ARCHIVE}>
                    <Archive className="size-4" />
                    {t("MENU.MY_ARTICLES")}
                  </Link>
                </Button>
                <Button asChild className="bg-accent-editor hover:bg-accent-editor/90">
                  <Link to={ROUTES.JOURNALIST_EDITOR}>
                    <Plus className="size-4" />
                    {t("journalist.archive.newArticle")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DashboardStatCard
                label={t("journalist.archive.status.draft")}
                value={stats.drafts}
                icon={FileText}
                accent="bg-accent-editor"
                href={`${ROUTES.JOURNALIST_ARCHIVE}?tab=draft`}
              />
              <DashboardStatCard
                label={t("journalist.dashboard.pendingConsent")}
                value={stats.pendingConsent}
                hint={t("journalist.dashboard.pendingConsentHint")}
                icon={Bell}
                accent="bg-accent-investigation"
              />
              <DashboardStatCard
                label={t("journalist.archive.status.published")}
                value={stats.published}
                icon={Archive}
                accent="bg-accent-editor-secondary"
                href={`${ROUTES.JOURNALIST_ARCHIVE}?tab=published`}
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="journalist-dashboard-panel lg:col-span-2">
              <div className="h-1 bg-accent-editor" />
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 font-headline text-base">
                  <PenLine className="size-4 text-accent-editor" />
                  {t("journalist.dashboard.recentDrafts")}
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground" asChild>
                  <Link to={`${ROUTES.JOURNALIST_ARCHIVE}?tab=draft`}>
                    {t("MENU.MY_ARTICLES")}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentDrafts.length > 0 ? (
                  <div className="space-y-2">
                    {recentDrafts.map((article) => (
                      <Link
                        key={article.id}
                        to={`${ROUTES.JOURNALIST_EDITOR}?id=${article.id}`}
                        className="journalist-dashboard-draft-row group flex items-center gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5 transition-colors"
                      >
                        <ArticleCoverImage
                          src={article.coverImage}
                          alt={article.title}
                          aspect="thumb"
                          className="rounded-md border border-border/60"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-medium transition-colors group-hover:text-accent-editor">
                            {article.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                            {article.trustScore != null ? (
                              <Badge variant="secondary" className="text-[10px]">
                                {article.trustScore}%
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="journalist-dashboard-empty rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-10 text-center">
                    <PenLine className="mx-auto size-8 text-accent-editor/50" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {t("journalist.dashboard.noDrafts")}
                    </p>
                    <Button className="mt-4 bg-accent-editor hover:bg-accent-editor/90" size="sm" asChild>
                      <Link to={ROUTES.JOURNALIST_EDITOR}>
                        <Plus className="size-4" />
                        {t("journalist.archive.newArticle")}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="journalist-dashboard-panel">
              <div className="h-1 bg-linear-to-r from-accent-editor-secondary to-accent-investigation" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-headline text-base">
                  <Bell className="size-4 text-accent-editor" />
                  {t("journalist.dashboard.notifications")}
                  {unreadCount > 0 ? (
                    <Badge className="h-5 min-w-5 justify-center rounded-full bg-secondary px-1.5 text-[10px] text-white">
                      {unreadCount}
                    </Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestNotification ? (
                  <div className="journalist-dashboard-notification rounded-lg border border-border/60 bg-muted/10 p-4">
                    <p className="text-sm leading-relaxed">{latestNotification.data.message}</p>
                    {latestNotification.data.article_title ? (
                      <p className="mt-2 text-xs font-medium text-accent-editor">
                        {latestNotification.data.article_title}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="journalist-dashboard-empty rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-10 text-center">
                    <Bell className="mx-auto size-7 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {t("journalist.notifications.empty")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
