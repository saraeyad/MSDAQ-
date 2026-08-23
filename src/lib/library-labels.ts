/** Arabic label derived from a MIME type (API no longer sends file_type). */
export type LibraryFileKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "spreadsheet"
  | "document"
  | "other";

export function libraryFileKind(
  mimeType: string | null | undefined,
): LibraryFileKind {
  if (!mimeType?.trim()) return "other";

  const mime = mimeType.toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime.includes("csv")
  ) {
    return "spreadsheet";
  }
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime.startsWith("text/")
  ) {
    return "document";
  }
  return "other";
}

export function libraryMimeTypeLabel(
  mimeType: string | null | undefined,
): string {
  switch (libraryFileKind(mimeType)) {
    case "image":
      return "صورة";
    case "video":
      return "فيديو";
    case "audio":
      return "صوت";
    case "pdf":
      return "PDF";
    case "spreadsheet":
      return "جدول";
    case "document":
      return "مستند";
    default:
      if (!mimeType?.trim()) return "ملف";
      return mimeType.split("/").pop() ?? "ملف";
  }
}

export function libraryFileExtension(
  fileName?: string | null,
  mimeType?: string | null,
): string {
  const fromName = fileName?.includes(".")
    ? fileName.split(".").pop()?.toUpperCase()
    : undefined;
  if (fromName && fromName.length <= 5) return fromName;

  const kind = libraryFileKind(mimeType);
  if (kind === "pdf") return "PDF";
  if (kind === "image" && mimeType) {
    return mimeType.split("/")[1]?.toUpperCase() ?? "IMG";
  }
  return "FILE";
}

/** File kinds the browser can show without forcing a download. */
export function canPreviewLibraryFile(
  mimeType: string | null | undefined,
): boolean {
  const kind = libraryFileKind(mimeType);
  return (
    kind === "image" ||
    kind === "video" ||
    kind === "audio" ||
    kind === "pdf" ||
    mimeType?.toLowerCase() === "text/plain"
  );
}
