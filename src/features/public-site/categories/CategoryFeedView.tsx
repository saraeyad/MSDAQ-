import {
  CategoryStoryBoard,
  CategoryStorySkeleton,
} from "@/features/public-site/categories/CategoryStories";
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
    <div className="category-feed">
      <section className="category-feed__hero">
        <div className="container-page">
          {headerLoading ? (
            <div className="h-10 w-56 max-w-full animate-pulse rounded-lg bg-muted md:h-12" />
          ) : (
            <h1 className="category-feed__title font-section text-3xl font-extrabold md:text-4xl">
              {title}
            </h1>
          )}
          {!headerLoading && description ? (
            <p className="category-feed__lead mt-1.5 max-w-2xl text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
          {!headerLoading && subcategoryLinks.length > 0 ? (
            <nav className="category-feed__subnav" aria-label={title}>
              {subcategoryLinks.map((link) => {
                const active = activeSubcategorySlug === link.slug;
                return (
                  <Link
                    key={link.slug}
                    to={categoryPath(link.slug)}
                    className={cn(
                      "category-feed__subnav-link",
                      active && "category-feed__subnav-link--active",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </section>

      <section className="container-page pb-6 pt-4 md:pb-8 md:pt-5">
        {isLoading ? (
          <CategoryStorySkeleton />
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
            <CategoryStoryBoard articles={articles} />

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
