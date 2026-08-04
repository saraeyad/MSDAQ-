/** Minimum text length before TTS generate. */
export const TTS_MIN_CHARS = 5;

/** Client abort — avoid hanging indefinitely on slow responses. */
export const TTS_REQUEST_TIMEOUT_MS = 120_000;

export function validateTtsText(text: string): string | null {
  if (text.trim().length < TTS_MIN_CHARS) {
    return `أدخل ${TTS_MIN_CHARS} أحرف على الأقل`;
  }
  return null;
}

/** Speech-to-text — upload + transcription can take several minutes. */
export const STT_REQUEST_TIMEOUT_MS = 180_000;

export const STT_PROCESSING_STEPS = [
  "جاري رفع الملف الصوتي...",
  "جاري تفريغ الكلام...",
  "جاري إعداد النص...",
] as const;
