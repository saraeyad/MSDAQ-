import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DiscussionFeedToolbar from "../components/discussion-feed-toolbar";
import PopularCategories from "../components/popular-categories";
import PostCard from "../components/post-card";
import PostComposeForm from "../components/post-compose-form";
import { getMockCategoryStats } from "../data/mock-posts";
import useDiscussionPosts from "../hooks/useDiscussionPosts";

export default function DiscussionBoard() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useDiscussionPosts({ page });

  const posts = data?.posts ?? [];
  const meta = data?.meta;

  return (
    <div className="discussion-page section-gap">
      <div className="container-discussion relative z-[1]">
        <header className="articles-animate-in mb-6 max-w-3xl md:mb-8">
          <p className="text-label-caps text-secondary">{t("MENU.DISCUSSION")}</p>
          <h1 className="page-title mt-2">{t("discussion.pageTitle")}</h1>
          <p className="page-description">{t("discussion.pageSubtitle")}</p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <main className="min-w-0 flex-1 space-y-5">
            <DiscussionFeedToolbar postCount={meta?.total ?? 0} />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <p className="py-16 text-center text-body-md text-muted-foreground">
                {t("discussion.empty")}
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      highlighted={index === 0}
                      animateIndex={index}
                    />
                  ))}
                </div>

                {meta && meta.last_page > 1 ? (
                  <div className="flex items-center justify-center gap-3 pt-4">
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
          </main>

          <aside className="w-full shrink-0 space-y-5 lg:sticky lg:top-24 lg:w-[320px]">
            <PostComposeForm />
            <PopularCategories categories={getMockCategoryStats()} />
          </aside>
        </div>
      </div>
    </div>
  );
}
