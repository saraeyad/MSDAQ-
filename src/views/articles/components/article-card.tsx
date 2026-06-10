import TrustBadge from "@/components/trust-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import type { Article } from "@/types/article";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ArticleCoverImage from "./article-cover-image";

function getExcerpt(article: Article): string {
  return (
    article.lead?.fusha ??
    article.content.fusha?.split("\n").find((p) => p.trim()) ??
    article.content.fusha ??
    ""
  );
}

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
  className?: string;
  animateIndex?: number;
}

export default function ArticleCard({
  article,
  variant = "default",
  className,
  animateIndex,
}: ArticleCardProps) {
  const { t } = useTranslation();
  const excerpt = getExcerpt(article);
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <Link
      to={ROUTES.ARTICLE(article.id)}
      className={cn(
        "article-card group flex overflow-hidden rounded-lg border border-border bg-card hover:border-secondary/50",
        animateIndex != null && "articles-animate-in",
        isFeatured ? "flex-col md:flex-row" : "flex-col",
        className,
      )}
      style={
        animateIndex != null
          ? { animationDelay: `${animateIndex * 75}ms` }
          : undefined
      }
    >
      <ArticleCoverImage
        src={article.featuredImage}
        alt={article.title}
        aspect={isFeatured ? "featured" : "card"}
        className={cn(
          "shrink-0 border-border",
          isFeatured ? "md:w-[52%] md:border-e" : "border-b",
          !isFeatured && "transition-transform duration-300 group-hover:scale-[1.02]",
        )}
        imageClassName="transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      <div
        className={cn(
          "flex flex-1 flex-col",
          isFeatured ? "p-6 md:p-8" : isCompact ? "p-4" : "p-5",
        )}
      >
        {isFeatured ? (
          <p className="text-label-caps text-secondary">{t("articles.featuredStory")}</p>
        ) : null}

        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-headline leading-snug transition-colors group-hover:text-secondary",
              isFeatured ? "mt-2 text-headline-md" : isCompact ? "text-base" : "text-headline-sm",
            )}
          >
            {article.title}
          </h3>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-secondary" />
        </div>

        <p className="mt-2 text-label-caps text-muted-foreground">
          {t("articles.byAuthor", { author: article.author })} ·{" "}
          {new Date(article.publishedAt).toLocaleDateString()}
        </p>

        {article.tags && article.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px] font-normal">
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : null}

        <p
          className={cn(
            "mt-3 flex-1 text-muted-foreground",
            isFeatured ? "line-clamp-4 text-body-md" : "line-clamp-3 text-sm",
          )}
        >
          {excerpt}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {article.trustScore != null ? (
            <TrustBadge score={article.trustScore} label={t("scores.trust")} />
          ) : null}
          {article.credibilityScore != null ? (
            <TrustBadge
              score={article.credibilityScore}
              label={t("scores.credibility")}
            />
          ) : null}
          {!isCompact ? (
            <span className="ms-auto text-xs font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
              {t("articles.readMore")}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
