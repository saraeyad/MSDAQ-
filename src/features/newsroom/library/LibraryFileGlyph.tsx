import { libraryFileExtension, libraryFileKind } from "@/lib/library-labels";
import { cn } from "@/lib/utils";
import {
  File,
  FileSpreadsheet,
  FileText,
  Film,
  ImageIcon,
  Music,
} from "lucide-react";

interface LibraryFileGlyphProps {
  fileName?: string | null;
  mimeType?: string | null;
  className?: string;
}

const KIND_ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  other: File,
} as const;

export function LibraryFileGlyph({
  fileName,
  mimeType,
  className,
}: LibraryFileGlyphProps) {
  const kind = libraryFileKind(mimeType);
  const Icon = KIND_ICONS[kind];
  const extension = libraryFileExtension(fileName, mimeType);

  return (
    <div
      className={cn(
        "library-file-glyph",
        `library-file-glyph--${kind}`,
        className,
      )}
    >
      <Icon className="library-file-glyph__icon" aria-hidden />
      <span className="library-file-glyph__badge">{extension}</span>
    </div>
  );
}
