import type { PublicCopy } from "@/lib/i18n/public-dictionary";
import type { PublicMediaType } from "@/types";

export function publicMediaTypeLabelFromCopy(
  copy: PublicCopy,
  type: PublicMediaType | string,
): string {
  const labels = copy.mediaTypes;
  if (type === "text") return labels.text;
  if (type === "audio") return labels.audio;
  if (type === "video") return labels.video;
  return type;
}
