import { HomeArticleCard } from "@/features/public-site/home/HomeArticleCard";
import {
  partitionFrontStack,
  type HomeFrontPack,
} from "@/features/public-site/home/home-feed-layout";
import { cn } from "@/lib/utils";

type HomeBbcFrontpageProps = {
  frontPack: HomeFrontPack;
  className?: string;
};

export function HomeBbcFrontpage({ frontPack, className }: HomeBbcFrontpageProps) {
  const { side: leftStories, rail: railStories } = partitionFrontStack(
    frontPack.stack,
  );
  const hasHero = Boolean(frontPack.lead);
  const hasSide = leftStories.length > 0;
  const hasRail = railStories.length > 0;

  if (!hasHero && !hasSide && !hasRail) {
    return null;
  }

  return (
    <div
      className={cn(
        "home-bbc-frontpage",
        !hasSide && "home-bbc-frontpage--no-side",
        !hasRail && "home-bbc-frontpage--no-rail",
        !hasHero && "home-bbc-frontpage--no-hero",
        className,
      )}
    >
      {hasSide ? (
        <div className="home-bbc-frontpage__side">
          {leftStories.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={index + 1}
              variant="editorialSide"
            />
          ))}
        </div>
      ) : null}

      {hasHero ? (
        <div className="home-bbc-frontpage__hero">
          <HomeArticleCard
            article={frontPack.lead!}
            index={0}
            variant="editorialHero"
          />
        </div>
      ) : null}

      {hasRail ? (
        <aside className="home-bbc-frontpage__rail" aria-label="Latest headlines">
          {railStories.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={index + 3}
              variant="editorialText"
            />
          ))}
        </aside>
      ) : null}
    </div>
  );
}
