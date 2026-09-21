import { usePlatformFeedback } from "@/context/platform-feedback";
import { useLocale, usePublicCopy } from "@/context/locale";
import { cn } from "@/lib/utils";

const FAB_ART = {
  ar: "/brand/sabbara-feedback-fab.webp?v=2",
  en: "/brand/sabbara-feedback-fab-en.webp?v=2",
} as const;

export function PlatformFeedbackFab() {
  const { feedbackOpen, openFeedback, trustIndexOpen } = usePlatformFeedback();
  const { locale } = useLocale();
  const { feedback } = usePublicCopy();
  const isEnglish = locale === "en";

  if (trustIndexOpen || feedbackOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className={cn(
        "platform-feedback-fab",
        isEnglish && "platform-feedback-fab--en",
      )}
      onClick={openFeedback}
      aria-label={feedback.fabAria}
    >
      <img
        src={FAB_ART[locale]}
        alt=""
        className="platform-feedback-fab__art"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </button>
  );
}
