import { Library_APIs } from "@/services/api/library";
import type { LibraryItem } from "@/types";

function extensionFromMime(mime: string | undefined): string {
  if (!mime) return "";
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "text/plain": ".txt",
  };
  return map[mime] ?? "";
}

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[/\\?%*:|"<>]/g, "-") || "download";
}

export async function fetchLibraryFile(
  id: number | string,
  disposition: "attachment" | "inline" = "attachment",
): Promise<Blob> {
  return Library_APIs.download(id, { disposition });
}

export async function downloadLibraryItem(
  item: Pick<LibraryItem, "id" | "title" | "file">,
): Promise<void> {
  const blob = await fetchLibraryFile(item.id, "attachment");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;

  const preferredName = item.file?.name?.trim();
  if (preferredName) {
    anchor.download = sanitizeFilename(preferredName);
  } else {
    const safeTitle = sanitizeFilename(item.title);
    const ext = extensionFromMime(blob.type || item.file?.mime_type);
    const hasExt = /\.[a-z0-9]+$/i.test(safeTitle);
    anchor.download = hasExt ? safeTitle : `${safeTitle}${ext}`;
  }

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
