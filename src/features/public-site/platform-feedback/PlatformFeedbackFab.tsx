import { usePlatformFeedback } from "@/context/platform-feedback";

const FAB_ART = "/brand/sabbara-feedback-fab.webp?v=2";

export function PlatformFeedbackFab() {
  const { feedbackOpen, openFeedback, trustIndexOpen } = usePlatformFeedback();

  if (trustIndexOpen || feedbackOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className="platform-feedback-fab"
      onClick={openFeedback}
      aria-label="شاركنا رأيك في منصة صبارة بوست"
    >
      <img
        src={FAB_ART}
        alt=""
        className="platform-feedback-fab__art"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </button>
  );
}
