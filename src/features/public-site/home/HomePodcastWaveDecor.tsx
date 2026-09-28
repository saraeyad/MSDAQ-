/** Decorative wave layers for the home audio reports band. */
export function HomePodcastWaveDecor() {
  return (
    <div className="home-audio-wave-band__waves" aria-hidden>
      <div className="home-audio-wave-band__wave-track home-audio-wave-band__wave-track--a">
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none">
          <path
            fill="currentColor"
            d="M0,28 C120,48 240,8 360,28 S600,48 720,28 960,8 1080,28 1200,48 1320,28 1440,18 V56 H0 Z"
          />
        </svg>
      </div>
      <div className="home-audio-wave-band__wave-track home-audio-wave-band__wave-track--b">
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none">
          <path
            fill="currentColor"
            d="M0,34 C160,14 320,44 480,34 S800,14 960,34 1120,44 1280,34 1440,24 V56 H0 Z"
          />
        </svg>
      </div>
    </div>
  );
}
