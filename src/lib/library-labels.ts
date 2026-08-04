import type { LibraryFileType } from "@/types";

const FILE_TYPE_LABELS: Record<LibraryFileType, string> = {
  image: "صورة",
  video: "فيديو",
  audio: "صوت",
  pdf: "PDF",
  document: "مستند",
  spreadsheet: "جدول",
  other: "أخرى",
};

export function libraryFileTypeLabel(type: string | null | undefined): string {
  if (!type) return "—";
  return FILE_TYPE_LABELS[type as LibraryFileType] ?? type;
}

export const LIBRARY_FILE_TYPE_OPTIONS: {
  value: LibraryFileType | "all";
  label: string;
}[] = [
  { value: "all", label: "كل الأنواع" },
  ...(
    Object.entries(FILE_TYPE_LABELS) as [LibraryFileType, string][]
  ).map(([value, label]) => ({ value, label })),
];
