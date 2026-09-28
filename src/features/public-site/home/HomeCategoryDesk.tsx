import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import type { HomeCategoryDesk as HomeCategoryDeskModel } from "@/features/public-site/home/home-feed-layout";
import { useLocale, usePublicCopy } from "@/context/locale";
import { cn } from "@/lib/utils";
import { categoryPath } from "@/router/routes";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HomeBandMoreLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  const { dir } = useLocale();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Link className="home-feed-band__more home-feed-band__more-row" to={to}>
      <span>{label}</span>
      <Arrow className="home-feed-band__more-arrow" aria-hidden />
    </Link>
  );
}

type HomeCategoryDeskProps = {
  desk: HomeCategoryDeskModel;
  title: string;
  cardIndexOffset: number;
  className?: string;
};

export function HomeCategoryDesk({
  desk,
  title,
  cardIndexOffset,
  className,
}: HomeCategoryDeskProps) {
  const { home } = usePublicCopy();
  const { layout, articles, slug } = desk;

  return (
    <section
      className={cn("home-feed-band home-feed-band--category", className)}
      aria-label={title}
    >
      <div className="home-feed-band__header">
        <h3 className="home-feed-band__title">{title}</h3>
      </div>

      {layout === "wide" ? (
        <div className="home-bbc-card-grid home-bbc-card-grid--duo">
          {articles.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={cardIndexOffset + index}
              variant="editorialSide"
            />
          ))}
        </div>
      ) : layout === "audio" ? (
        <div className="home-feed-audio-list">
          {articles.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={cardIndexOffset + index}
              variant="audioRow"
            />
          ))}
        </div>
      ) : layout === "video" ? (
        <div className="home-bbc-card-grid home-bbc-card-grid--duo">
          {articles.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={cardIndexOffset + index}
              variant="editorialSide"
            />
          ))}
        </div>
      ) : (
        <div className="home-bbc-card-grid">
          {articles.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={cardIndexOffset + index}
              variant="editorialSide"
            />
          ))}
        </div>
      )}

      <HomeBandMoreLink to={categoryPath(slug)} label={home.more} />
    </section>
  );
}
