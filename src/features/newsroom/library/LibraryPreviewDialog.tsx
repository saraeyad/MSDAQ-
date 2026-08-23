import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { libraryFileKind } from "@/lib/library-labels";
import type { LibraryItem } from "@/types";

interface LibraryPreviewDialogProps {
  item: LibraryItem | null;
  blobUrl: string | null;
  onClose: () => void;
}

export function LibraryPreviewDialog({
  item,
  blobUrl,
  onClose,
}: LibraryPreviewDialogProps) {
  const mimeType = item?.file?.mime_type;
  const kind = libraryFileKind(mimeType);
  const title = item?.title ?? "معاينة الملف";

  return (
    <Dialog open={!!item && !!blobUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="library-preview-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {item?.file?.name ? (
            <DialogDescription dir="ltr">{item.file.name}</DialogDescription>
          ) : null}
        </DialogHeader>

        {blobUrl ? (
          <div className="library-preview-dialog__frame">
            {kind === "image" ? (
              <img
                src={blobUrl}
                alt={title}
                className="library-preview-dialog__media"
              />
            ) : null}
            {kind === "video" ? (
              <video
                src={blobUrl}
                controls
                className="library-preview-dialog__media"
              />
            ) : null}
            {kind === "audio" ? (
              <audio
                src={blobUrl}
                controls
                className="library-preview-dialog__audio"
              />
            ) : null}
            {kind === "pdf" || mimeType?.toLowerCase() === "text/plain" ? (
              <iframe
                src={blobUrl}
                title={title}
                className="library-preview-dialog__iframe"
              />
            ) : null}
            {kind !== "image" &&
            kind !== "video" &&
            kind !== "audio" &&
            kind !== "pdf" &&
            mimeType?.toLowerCase() !== "text/plain" ? (
              <p className="library-preview-dialog__fallback">
                لا يمكن عرض هذا النوع من الملفات هنا — استخدم تحميل.
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
