import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import { Button } from "@/components/ui/button";
import { useLocale, usePublicCopy } from "@/context/locale";
import { cn } from "@/lib/utils";
import { categoryPath } from "@/router/routes";
import type { PublicArticle, PublicPagination } from "@/types";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export interface CategorySubcategoryLink {
  slug: string;
  label: string;
}

interface CategoryFeedViewProps {
  title: string;
  headerLoading?: boolean;
  description?: string | null;
  subcategoryLinks?: CategorySubcategoryLink[];
  activeSubcategorySlug?: string;
  articles: PublicArticle[];
  pagination?: PublicPagination;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CategoryFeedView({
  title,
  headerLoading = false,
  description,
  subcategoryLinks = [],
  activeSubcategorySlug,
  articles,
  pagination,
  isLoading,
  page,
  onPageChange,
  emptyTitle,
  emptyDescription,
}: CategoryFeedViewProps) {
  const { dir } = useLocale();
  const { common, categories: categoriesCopy } = usePublicCopy();
  const resolvedEmptyTitle = emptyTitle ?? categoriesCopy.emptyFeedTitle;
  const resolvedEmptyDescription =
    emptyDescription ?? categoriesCopy.emptyFeedDescription;
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div className="pb-16">
      <section className="public-page-hero border-b border-border py-12 md:py-16">
        <div className="container-page">
          {headerLoading ? (
            <div className="h-10 w-56 max-w-full animate-pulse rounded-lg bg-muted md:h-12" />
          ) : (
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              {title}
            </h1>
          )}
          {!headerLoading && description ? (
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
              {description}
            </p>
          ) : null}
          {!headerLoading && subcategoryLinks.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {subcategoryLinks.map((link) => {
                const active = activeSubcategorySlug === link.slug;
                return (
                  <Link
                    key={link.slug}
                    to={categoryPath(link.slug)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
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
              {resolvedEmptyTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {resolvedEmptyDescription}
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
                  <PrevIcon className="size-4" />
                  {common.previous}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {common.pageOf(pagination.current_page, pagination.last_page)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.last_page}
                  onClick={() => onPageChange(page + 1)}
                >
                  {common.next}
                  <NextIcon className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
