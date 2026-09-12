/** Standalone STT upload limits (mirror backend validation). */
export const STT_MAX_FILE_BYTES = 25 * 1024 * 1024;

const STT_ACCEPTED_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".m4a",
  ".ogg",
  ".webm",
  ".mpeg",
  ".mpga",
  ".flac",
]);

export function appendSttAudioField(formData: FormData, file: File): void {
  formData.append("audio", file, file.name || "audio.mp3");
}

export function validateSttAudioFile(file: File): string | null {
  if (file.size === 0) {
    return "الملف فارغ";
  }
  if (file.size > STT_MAX_FILE_BYTES) {
    return "حجم الملف يجب ألا يتجاوز 25 ميغابايت";
  }

  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!ext || !STT_ACCEPTED_EXTENSIONS.has(ext)) {
    return "صيغة غير مدعومة — استخدم MP3 أو WAV أو M4A أو OGG";
  }

  return null;
}

export const STT_ACCEPT_ATTR = "audio/*,.mp3,.wav,.m4a,.ogg,.webm,.flac";
