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
  const { rail: railStories, promos } = partitionFrontStack(frontPack.stack);
  const railLead = railStories[0] ?? null;
  const railRest = railStories.slice(1);
  const hasHero = Boolean(frontPack.lead);
  const hasRail = railStories.length > 0;
  const hasPromos = promos.length > 0;

  if (!hasHero && !hasRail && !hasPromos) {
    return null;
  }

  return (
    <div className={cn("home-bbc-front", className)}>
      <div
        className={cn(
          "home-bbc-frontpage",
          !hasRail && "home-bbc-frontpage--no-rail",
          !hasHero && "home-bbc-frontpage--no-hero",
        )}
      >
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
            {railLead ? (
              <HomeArticleCard
                key={railLead.id}
                article={railLead}
                index={1}
                variant="editorialSide"
                className="home-editorial--rail-lead"
              />
            ) : null}
            {railRest.map((article, index) => (
              <HomeArticleCard
                key={article.id}
                article={article}
                index={index + 2}
                variant="editorialText"
              />
            ))}
          </aside>
        ) : null}
      </div>

      {hasPromos ? (
        <div className="home-bbc-promo-row home-strip">
          {promos.map((article, index) => (
            <HomeArticleCard
              key={article.id}
              article={article}
              index={index + 5}
              variant="editorialSide"
              className="home-editorial--promo"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
