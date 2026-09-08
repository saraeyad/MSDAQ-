import { Button } from "@/components/ui/button";
import { useLocale, usePublicCopy } from "@/context/locale";
import { articlePath, ROUTES } from "@/router/routes";
import { Articles_APIs } from "@/services/api/articles";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Circle, Play } from "lucide-react";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/images/hero-people.jpg";
const HERO_FALLBACK = "/images/hero-verification.png";

export function HomeHero() {
  const { dir } = useLocale();
  const copy = usePublicCopy();
  const hero = copy.hero;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const { data: videoData } = useQuery({
    queryKey: ["home-latest-video"],
    queryFn: () =>
      Articles_APIs.list({
        latest: true,
        media_type: "video",
      }),
    staleTime: 60_000,
  });

  const latestVideo = videoData?.items?.find((a) => a.media_type === "video");
  const playHref = latestVideo ? articlePath(latestVideo.id) : ROUTES.ARTICLES;

  return (
    <section className="home-cinematic-hero" aria-labelledby="home-hero-title">
      <div className="home-cinematic-hero__bg" aria-hidden>
        <img
          src={HERO_IMAGE}
          alt=""
          className="home-cinematic-hero__photo"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.src.endsWith(HERO_FALLBACK)) return;
            img.src = HERO_FALLBACK;
          }}
        />
      </div>

      <div className="home-cinematic-hero__scrim" aria-hidden />
      <div className="home-cinematic-hero__grain" aria-hidden />

      <div className="home-cinematic-hero__viewfinder" aria-hidden>
        <span className="home-cinematic-hero__corner home-cinematic-hero__corner--tl" />
        <span className="home-cinematic-hero__corner home-cinematic-hero__corner--tr" />
        <span className="home-cinematic-hero__corner home-cinematic-hero__corner--bl" />
        <span className="home-cinematic-hero__corner home-cinematic-hero__corner--br" />
      </div>

      <span className="home-cinematic-hero__rec" aria-hidden>
        <Circle className="home-cinematic-hero__rec-dot" />
        {hero.rec}
      </span>

      <div className="home-cinematic-hero__content">
        <div className="home-cinematic-hero__copy">
          <h1 id="home-hero-title" className="home-cinematic-hero__title">
            <span className="home-cinematic-hero__title-line">
              {hero.headline}
            </span>
            <span className="home-cinematic-hero__title-line">
              {hero.headlineAccent}
            </span>
          </h1>

          <p className="home-cinematic-hero__brand">{hero.brandLine}</p>
          <p className="home-cinematic-hero__lead">{hero.lead}</p>

          <div className="home-cinematic-hero__actions">
            <Button asChild size="lg" className="home-cinematic-hero__cta">
              <Link to={ROUTES.ARTICLES}>
                {hero.ctaExplore}
                <Arrow className="size-4" />
              </Link>
            </Button>
            <Link to={playHref} className="home-cinematic-hero__play-link">
              <span className="home-cinematic-hero__play-icon" aria-hidden>
                <Play className="size-4 fill-current" />
              </span>
              <span>{hero.ctaPlay}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="home-cinematic-hero__spine" aria-hidden>
        {hero.spine.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </section>
  );
}
