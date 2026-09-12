import { usePublicCopy } from "@/context/locale";
import { Circle } from "lucide-react";

const HERO_IMAGE = "/images/hero-people.jpg";
const HERO_FALLBACK = "/images/hero-verification.png";

export function HomeHero() {
  const copy = usePublicCopy();
  const hero = copy.hero;

  return (
    <section className="home-cinematic-hero" aria-labelledby="home-hero-title">
      <div className="home-cinematic-hero__bg" aria-hidden>
        <img
          src={HERO_IMAGE}
          alt=""
          className="home-cinematic-hero__photo"
          loading="eager"
          fetchPriority="high"
          decoding="async"
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
          {/* <div className="home-cinematic-hero__actions" aria-hidden /> */}
        </div>
      </div>

      <div className="home-cinematic-hero__center-logo">
        <span className="home-cinematic-hero__center-logo-grain" aria-hidden />
        <img
          src="/brand/cdmc.png?v=2"
          alt="مركز التنمية والإعلام المجتمعي"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="home-cinematic-hero__spine" aria-hidden>
        {hero.spine.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </section>
  );
}
