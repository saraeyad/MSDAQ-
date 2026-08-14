import { Button } from "@/components/ui/button";
import { libraryFileTypeLabel } from "@/lib/library-labels";
import type { LibraryItem } from "@/types";
import { Download, Loader2, Pencil, Trash2 } from "lucide-react";

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
  return (
    <div className="library-item-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-headline text-sm font-bold leading-snug">
            {item.title}
          </p>
          {item.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {item.description}
            </p>
          ) : null}
        </div>
        <span className="library-item-card__type">
          {libraryFileTypeLabel(item.file_type)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {item.category ? <span>{item.category}</span> : null}
        {item.uploaded_by ? <span>· {item.uploaded_by.name}</span> : null}
        <span>· {new Date(item.created_at).toLocaleDateString("ar")}</span>
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
            className="size-8"
            disabled={isDeleting}
            aria-label={`حذف ${item.title}`}
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
