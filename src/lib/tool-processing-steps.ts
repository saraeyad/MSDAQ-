import { absoluteMediaUrlForApi } from "@/lib/media-url";

export const STANDARDS_PROCESSING_STEPS = [
  "جاري قراءة المحتوى...",
  "جاري فحص المعايير التحريرية...",
  "جاري تقييم الفصحى...",
  "قد يستغرق الفحص حتى 3 دقائق — يُرجى الانتظار",
] as const;

export const CREDIBILITY_PROCESSING_STEPS = [
  "جاري استخراج الادعاءات...",
  "جاري التحقق من المصداقية...",
  "جاري تجميع النتائج...",
] as const;

export const REVERSE_IMAGE_PROCESSING_STEPS = [
  "جاري تحميل الصورة...",
  "جاري البحث في المصادر...",
  "جاري تجميع النتائج...",
] as const;

export const AI_DETECTION_PROCESSING_STEPS = [
  "جاري تحميل الصورة...",
  "جاري تحليل الصورة...",
  "جاري تجميع النتيجة...",
] as const;

export const TTS_PROCESSING_STEPS = [
  "جاري تحضير النص...",
  "جاري توليد الصوت...",
  "جاري حفظ الملف...",
] as const;

export const LOCALIZATION_PROCESSING_STEPS = [
  "جاري قراءة المحتوى...",
  "جاري التبسيط...",
  "جاري توليد اللهجة...",
] as const;

/** Resolve a public image URL for tool APIs (full https or storage path). */
export function resolveToolImageUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("storage/") ||
    trimmed.startsWith("storage\\")
  ) {
    return absoluteMediaUrlForApi(trimmed);
  }
  return null;
}
