import PageWrapper from "@/components/page-wrapper";
import SectionTitle from "@/components/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/router/routes";
import { Loader, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatRelativeTime } from "@/views/discussion/utils/format-relative-time";
import useAdminDiscussionActions from "../hooks/use-admin-discussion-actions";
import useRemovedDiscussionPosts from "../hooks/use-removed-discussion-posts";

export default function AdminDiscussionModeration() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useRemovedDiscussionPosts({ page });
  const { restorePost, isRestoring } = useAdminDiscussionActions();

  const posts = data?.posts ?? [];
  const meta = data?.meta;

  return (
    <PageWrapper
      breadcrumbsItems={[
        { name: t("MENU.ADMIN_DASHBOARD"), path: ROUTES.ADMIN_DASHBOARD },
        { name: t("MENU.DISCUSSION_MODERATION") },
      ]}
    >
      <div className="space-y-6">
        <div>
          <SectionTitle>{t("admin.discussion.title")}</SectionTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("admin.discussion.description")}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center text-body-md text-muted-foreground">
            {t("admin.discussion.empty")}
          </p>
        ) : (
          <>
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{post.author}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatRelativeTime(post.createdAt)}
                      </p>
                    </div>
                    <Badge variant="destructive">{t("admin.discussion.removed")}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="whitespace-pre-wrap text-body-md leading-relaxed text-foreground">
                      {post.content}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRestoring}
                      onClick={() => restorePost(post.id)}
                    >
                      {isRestoring ? (
                        <Loader className="size-4 animate-spin" />
                      ) : (
                        <RotateCcw className="size-4" />
                      )}
                      {t("admin.discussion.restore")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {meta && meta.last_page > 1 ? (
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  {t("discussion.previousPage")}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t("discussion.pageOf", {
                    current: meta.current_page,
                    total: meta.last_page,
                  })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= meta.last_page || isFetching}
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, meta.last_page))
                  }
                >
                  {t("discussion.nextPage")}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
