import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import type { HomeCategoryDesk as HomeCategoryDeskModel } from "@/features/public-site/home/home-feed-layout";
import { cn } from "@/lib/utils";
import { categoryPath } from "@/router/routes";
import { Link } from "react-router-dom";

type HomeCategoryDeskProps = {
  desk: HomeCategoryDeskModel;
  title: string;
  moreLabel: string;
  cardIndexOffset: number;
  className?: string;
};

export function HomeCategoryDesk({
  desk,
  title,
  moreLabel,
  cardIndexOffset,
  className,
}: HomeCategoryDeskProps) {
  const { layout, articles, slug } = desk;

  return (
    <section
      className={cn("home-feed-band home-feed-band--category", className)}
      aria-label={title}
    >
      <div className="home-feed-band__header">
        <h3 className="home-feed-band__title">{title}</h3>
        <Link className="home-feed-band__more" to={categoryPath(slug)}>
          {moreLabel}
        </Link>
      </div>

      {layout === "wide" ? (
        <div className="home-feed-wide-grid">
          {articles.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={cardIndexOffset + index}
              wide
              className="home-feed-wide-grid__card"
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
        <div className="home-feed-videos">
          {articles.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={cardIndexOffset + index}
              className="home-feed-videos__card"
            />
          ))}
        </div>
      ) : (
        <div className="home-feed-text-grid">
          {articles.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={cardIndexOffset + index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
