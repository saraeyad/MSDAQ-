import { CenterDefinitionSection } from "@/features/public-site/about/CenterDefinitionSection";
import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";
import { usePublicCopy } from "@/context/locale";

export default function AboutPage() {
  const { about } = usePublicCopy();

  return (
    <div className="about-speech">
      <PublicPageHero
        title={about.title}
        kicker={about.kicker}
        description={about.lead}
      />

      <CenterDefinitionSection alt={about.collageAlt} />

      <div className="container-page about-speech__body">
        <section className="about-speech__chapter" aria-labelledby="about-vision">
          <header className="about-speech__head">
            <span className="about-speech__mark" aria-hidden>
              01
            </span>
            <h2 id="about-vision" className="about-speech__title">
              {about.visionTitle}
            </h2>
          </header>
          <p className="about-speech__text">{about.visionBody}</p>
          <blockquote className="about-speech__quote">{about.visionQuote}</blockquote>
        </section>

        <section className="about-speech__chapter" aria-labelledby="about-mission">
          <header className="about-speech__head">
            <span className="about-speech__mark" aria-hidden>
              02
            </span>
            <h2 id="about-mission" className="about-speech__title">
              {about.missionTitle}
            </h2>
          </header>
          <p className="about-speech__text">{about.missionBody}</p>
          <blockquote className="about-speech__quote">{about.missionQuote}</blockquote>
        </section>

        <section
          className="about-speech__chapter"
          aria-labelledby="about-philosophy"
        >
          <header className="about-speech__head">
            <span className="about-speech__mark" aria-hidden>
              03
            </span>
            <h2 id="about-philosophy" className="about-speech__title">
              {about.philosophyTitle}
            </h2>
          </header>
          <p className="about-speech__text">{about.philosophyBody}</p>
        </section>

        <section className="about-speech__chapter" aria-labelledby="about-values">
          <header className="about-speech__head">
            <span className="about-speech__mark" aria-hidden>
              04
            </span>
            <div>
              <h2 id="about-values" className="about-speech__title">
                {about.valuesTitle}
              </h2>
              <p className="about-speech__lead">{about.valuesLead}</p>
            </div>
          </header>

          <ol className="about-speech__values">
            {about.values.map((value, index) => (
              <li key={value.title} className="about-speech__value">
                <span className="about-speech__value-n" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="about-speech__value-title">{value.title}</h3>
                <p className="about-speech__value-body">{value.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
