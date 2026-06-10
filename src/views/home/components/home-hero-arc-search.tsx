import i18n from "@/i18n";

const ARC_PATH_LTR = "M 10 80 Q 50 8 90 80";
const ARC_PATH_RTL = "M 90 80 Q 50 8 10 80";

/** Decorative magnifying glass tracing an arc behind the hero content */
export default function HomeHeroArcSearch() {
  const isRtl = i18n.dir() === "rtl";
  const arcPath = isRtl ? ARC_PATH_RTL : ARC_PATH_LTR;

  return (
    <div className="home-hero-arc-layer" aria-hidden>
      <svg
        className="home-hero-arc-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        overflow="visible"
      >
        <path className="home-hero-arc-trail-path" d={arcPath} />

        <g className="home-hero-arc-search-icon">
          <g className="home-hero-arc-search-glyph">
            <circle cx="0" cy="0" r="3.5" stroke="currentColor" strokeWidth="1.25" />
            <line
              x1="2.5"
              y1="2.5"
              x2="6"
              y2="6"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </g>
          <animateMotion
            dur="16s"
            repeatCount="indefinite"
            rotate="auto"
            path={arcPath}
            keyPoints="0;1;0"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
          />
        </g>
      </svg>
    </div>
  );
}
