import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import { Button } from "@/components/ui/button";
import type { PublicArticle, PublicPagination } from "@/types";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface CategoryFeedViewProps {
  badge: string;
  title: string;
  headerLoading?: boolean;
  description?: string | null;
  articles: PublicArticle[];
  pagination?: PublicPagination;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CategoryFeedView({
  badge,
  title,
  headerLoading = false,
  description,
  articles,
  pagination,
  isLoading,
  page,
  onPageChange,
  emptyTitle = "لا يوجد محتوى منشور حالياً",
  emptyDescription = "تابعنا للاطلاع على المحتوى القادم.",
}: CategoryFeedViewProps) {
  return (
    <div className="pb-16">
      <section className="border-b border-border bg-gradient-to-bl from-muted/50 via-card to-card py-12 md:py-16">
        <div className="container-page">
          {headerLoading ? (
            <>
              <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
              <div className="mt-4 h-10 w-56 max-w-full animate-pulse rounded-lg bg-muted md:h-12" />
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
                {badge}
              </span>
              <h1 className="mt-4 font-headline text-3xl font-bold md:text-4xl">
                {title}
              </h1>
            </>
          )}
          {!headerLoading && description ? (
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[280px] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
            <Sparkles className="mx-auto size-8 text-primary" />
            <p className="mt-4 font-headline text-lg font-semibold">
              {emptyTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <HomeArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  featured={index === 0}
                  className={index === 0 ? "sm:col-span-2" : undefined}
                />
              ))}
            </div>

            {pagination && pagination.last_page > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronRight className="size-4" />
                  السابق
                </Button>
                <span className="text-sm text-muted-foreground">
                  صفحة {pagination.current_page} من {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.last_page}
                  onClick={() => onPageChange(page + 1)}
                >
                  التالي
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
