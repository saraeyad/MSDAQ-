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

      <p className="home-cinematic-hero__script" aria-hidden>
        <span className="home-cinematic-hero__script-text">{hero.scriptLine}</span>
        <svg
          className="home-cinematic-hero__script-underline"
          viewBox="0 0 280 12"
          preserveAspectRatio="none"
        >
          <path
            d="M4 8 C 60 2, 120 10, 180 5 S 260 4, 276 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </p>

      <div className="home-cinematic-hero__spine" aria-hidden>
        {hero.spine.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </section>
  );
}
