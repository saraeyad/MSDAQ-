import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import { HomeHero } from "@/features/public-site/home/HomeHero";
import { HomeToolsSection } from "@/features/public-site/home/HomeToolsSection";
import { PartnersStrip } from "@/features/public-site/partners/PartnersStrip";
import { NewsSlider } from "@/components/news-slider";
import { usePublicCategories } from "@/hooks/usePublicCategories";
import { cn } from "@/lib/utils";
import { Articles_APIs } from "@/services/api/articles";
import type { PublicArticle } from "@/types";
import { FileText, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const MEDIA_FILTERS = [
  { id: "all", label: "الكل", icon: Layers },
] as const;

function matchesFilter(article: PublicArticle, filterId: string): boolean {
  if (filterId === "all") return true;
  return article.category?.slug === filterId;
}

function cardLayout(index: number) {
  if (index === 0) return { featured: true, wide: false, className: "sm:col-span-2" };
  if (index === 3) return { featured: false, wide: true, className: "lg:col-span-2" };
  return { featured: false, wide: false, className: "" };
}

function filterEmptyMessage(
  filterId: string,
  filters: { id: string; label: string }[],
): string {
  if (filterId !== "all") {
    const category = filters.find((filter) => filter.id === filterId);
    if (category) return `لا توجد مقالات في «${category.label}».`;
  }
  return "لا توجد مقالات مطابقة لهذا الفلتر.";
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: categories = [] } = usePublicCategories();

  const filters = useMemo(
    () => [
      ...MEDIA_FILTERS,
      ...categories.map((category) => ({
        id: category.slug,
        label: category.name_ar,
        icon: FileText,
      })),
    ],
    [categories],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["home-articles"],
    queryFn: () => Articles_APIs.list({ latest: true }),
  });

  const articles = data?.items ?? [];

  const filteredArticles = useMemo(
    () => articles.filter((a) => matchesFilter(a, activeFilter)),
    [articles, activeFilter],
  );

  return (
    <div className="pb-16">
      <HomeHero />

      <section className="w-full">
        {isLoading ? (
          <div className="h-56 w-full animate-pulse bg-muted md:h-80 lg:h-[28rem]" />
        ) : articles.length === 0 ? (
          <div className="container-page rounded-xl border-2 border-border bg-card p-12 text-center text-muted-foreground">
            لا توجد مقالات منشورة حالياً.
          </div>
        ) : (
          <NewsSlider articles={articles} variant="banner" fullWidth />
        )}
      </section>

      <section className="relative overflow-hidden py-10 md:py-14">
        <div className="pointer-events-none absolute inset-0 news-section-bg" />

        <div className="container-page relative">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
              أحدث المحتوى
            </span>
            <h2 className="mt-4 font-headline text-2xl font-bold md:text-3xl">
              استكشف الأخبار والتحققات
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              تصفّح أحدث عشرة مقالات من المنصة
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            {articles.length > 0 && (
              <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card/80 p-1.5 shadow-sm backdrop-blur-sm hide-scrollbar">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const active = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-10">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[280px] animate-pulse rounded-2xl bg-muted/80",
                      i === 0 && "sm:col-span-2",
                      i === 3 && "lg:col-span-2",
                    )}
                  />
                ))}
              </div>
            ) : articles.length === 0 ? null : filteredArticles.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                {filterEmptyMessage(activeFilter, filters)}
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article, index) => {
                  const layout = cardLayout(index);
                  return (
                    <HomeArticleCard
                      key={article.id}
                      article={article}
                      index={index}
                      featured={layout.featured}
                      wide={layout.wide}
                      className={layout.className}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <PartnersStrip />

      <HomeToolsSection />
    </div>
  );
}
