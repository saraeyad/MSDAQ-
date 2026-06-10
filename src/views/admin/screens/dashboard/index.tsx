import DashboardStatCard from "@/components/dashboard-stat-card";
import PageWrapper from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/router/routes";
import AdminDiscussion_APIs from "@/services/api/admin-discussion";
import AdminJournalistRequests_APIs from "@/services/api/admin-journalist-requests";
import { parseRemovedDiscussionPostsResponse } from "@/services/types/admin-discussion";
import { parseJournalistRequestsListResponse } from "@/services/types/admin-journalist-requests";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { t } = useTranslation();

  const { data: pendingRequests, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-journalist-requests", "pending"],
    queryFn: async () => {
      const response = await AdminJournalistRequests_APIs.list({ status: "pending" });
      return parseJournalistRequestsListResponse(response.data);
    },
  });

  const { data: removedPosts, isLoading: removedLoading } = useQuery({
    queryKey: ["admin-discussion", "removed"],
    queryFn: async () => {
      const response = await AdminDiscussion_APIs.listRemoved();
      return parseRemovedDiscussionPostsResponse(response.data);
    },
  });

  const isLoading = pendingLoading || removedLoading;
  const pendingCount = pendingRequests?.length ?? 0;
  const removedCount = removedPosts?.meta.total ?? 0;
  const recentRequests = pendingRequests ?? [];

  return (
    <div className="admin-dashboard-page -mx-4 -mt-6 px-4 pb-8 pt-6 md:-mx-0 md:px-0">
      <PageWrapper breadcrumbsItems={[{ name: t("MENU.ADMIN_DASHBOARD") }]}>
        <div className="space-y-8">
          <div>
            <p className="text-label-caps text-secondary">{t("admin.dashboard.commandCenter")}</p>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("admin.dashboard.subtitle")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DashboardStatCard
              label={t("admin.pendingRequests")}
              value={pendingCount}
              hint={t("admin.pendingRequestsHint")}
              icon={UserPlus}
              accent="bg-secondary"
              href={ROUTES.ADMIN_JOURNALIST_REQUESTS}
              loading={isLoading}
            />
            <DashboardStatCard
              label={t("admin.dashboard.moderationCount")}
              value={removedCount}
              hint={t("admin.discussion.description")}
              icon={MessageSquare}
              accent="bg-accent-admin"
              href={ROUTES.ADMIN_DISCUSSION}
              loading={isLoading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link to={ROUTES.ADMIN_JOURNALIST_REQUESTS} className="dashboard-action-tile group block">
              <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <UserPlus className="size-5 text-secondary" />
                    {t("admin.reviewRequests")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t("admin.pendingRequestsHint")}</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={ROUTES.ADMIN_DISCUSSION} className="dashboard-action-tile group block">
              <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    <MessageSquare className="size-5 text-accent-admin" />
                    {t("admin.discussion.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t("admin.discussion.description")}</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {recentRequests.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{t("admin.dashboard.recentRequests")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{request.applicantName}</p>
                      <p className="text-xs text-muted-foreground">{request.applicantEmail}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={ROUTES.ADMIN_JOURNALIST_REQUEST_DETAIL(request.id)}>
                        {t("BTN.REVIEW")}
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </PageWrapper>
    </div>
  );
}
