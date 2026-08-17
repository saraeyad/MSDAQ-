import { Button } from "@/components/ui/button";
import { LibraryFileGlyph } from "@/features/newsroom/library/LibraryFileGlyph";
import { libraryMimeTypeLabel } from "@/lib/library-labels";
import type { LibraryItem } from "@/types";
import { Calendar, Download, Loader2, Pencil, Trash2, User } from "lucide-react";

interface LibraryItemCardProps {
  item: LibraryItem;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: LibraryItem) => void;
  onDelete: (item: LibraryItem) => void;
  onDownload: (item: LibraryItem) => void;
  isDeleting: boolean;
  isDownloading: boolean;
}

export function LibraryItemCard({
  item,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onDownload,
  isDeleting,
  isDownloading,
}: LibraryItemCardProps) {
  const fileName = item.file?.name;
  const fileSize = item.file?.size;
  const typeLabel = libraryMimeTypeLabel(item.file?.mime_type);

  return (
    <article className="library-item-card">
      <div className="library-item-card__top">
        <LibraryFileGlyph
          fileName={fileName}
          mimeType={item.file?.mime_type}
        />
        <div className="library-item-card__copy">
          <div className="library-item-card__title-row">
            <h3 className="library-item-card__title" title={item.title}>
              {item.title}
            </h3>
            <span className="library-item-card__type">{typeLabel}</span>
          </div>
          {item.description ? (
            <p className="library-item-card__description">{item.description}</p>
          ) : null}
        </div>
      </div>

      {fileName ? (
        <p className="library-item-card__file" dir="ltr" title={fileName}>
          <span className="library-item-card__file-name">{fileName}</span>
          {fileSize ? (
            <span className="library-item-card__file-size">{fileSize}</span>
          ) : null}
        </p>
      ) : null}

      <div className="library-item-card__meta">
        {item.uploaded_by ? (
          <span>
            <User className="size-3.5" aria-hidden />
            {item.uploaded_by.name}
          </span>
        ) : null}
        <span>
          <Calendar className="size-3.5" aria-hidden />
          {new Date(item.created_at).toLocaleDateString("ar")}
        </span>
      </div>

      <div className="library-item-card__actions">
        <Button
          variant="outline"
          size="sm"
          disabled={isDownloading}
          onClick={() => onDownload(item)}
        >
          {isDownloading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          تحميل
        </Button>
        {canEdit ? (
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Pencil className="size-3.5" />
            تعديل
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            variant="ghost"
            size="icon"
            className="library-item-card__delete"
            disabled={isDeleting}
            aria-label={`حذف ${item.title}`}
            onClick={() => onDelete(item)}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
