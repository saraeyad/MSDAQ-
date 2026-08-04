import { Library_APIs } from "@/services/api/library";

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
  };
  return map[mime] ?? "";
}

export async function downloadLibraryItem(
  id: number,
  title: string,
  fileType?: string,
): Promise<void> {
  const blob = await Library_APIs.download(id);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;

  const safeTitle = title.trim().replace(/[/\\?%*:|"<>]/g, "-") || "download";
  const ext = extensionFromMime(blob.type);
  const hasExt = /\.[a-z0-9]+$/i.test(safeTitle);
  anchor.download = hasExt ? safeTitle : `${safeTitle}${ext || (fileType === "pdf" ? ".pdf" : "")}`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
