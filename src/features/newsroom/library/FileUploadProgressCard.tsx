import { Button } from "@/components/ui/button";
import { LibraryFileGlyph } from "@/features/newsroom/library/LibraryFileGlyph";
import { formatFileSize } from "@/lib/format-file-size";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  CloudUpload,
  Trash2,
  XCircle,
} from "lucide-react";

export type FileUploadProgressStatus = "uploading" | "complete" | "failed";

interface FileUploadProgressCardProps {
  file: File;
  status: FileUploadProgressStatus;
  progress: number;
  errorMessage?: string;
  onRemove?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function FileUploadProgressCard({
  file,
  status,
  progress,
  errorMessage,
  onRemove,
  onRetry,
  className,
}: FileUploadProgressCardProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "file-upload-progress",
        status === "failed" && "file-upload-progress--failed",
        className,
      )}
    >
      <LibraryFileGlyph fileName={file.name} mimeType={file.type} />

      <div className="file-upload-progress__body">
        <div className="file-upload-progress__header">
          <p className="file-upload-progress__name" dir="ltr" title={file.name}>
            {file.name}
          </p>
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="file-upload-progress__remove"
              disabled={status === "uploading"}
              aria-label="إزالة الملف"
              onClick={onRemove}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>

        <div className="file-upload-progress__meta">
          <span>{formatFileSize(file.size)}</span>
          <span className="file-upload-progress__meta-sep" aria-hidden>
            |
          </span>
          {status === "uploading" ? (
            <span className="file-upload-progress__status file-upload-progress__status--uploading">
              <CloudUpload className="size-3.5" aria-hidden />
              جاري الرفع...
            </span>
          ) : null}
          {status === "complete" ? (
            <span className="file-upload-progress__status file-upload-progress__status--complete">
              <CheckCircle2 className="size-3.5" aria-hidden />
              اكتمل
            </span>
          ) : null}
          {status === "failed" ? (
            <span className="file-upload-progress__status file-upload-progress__status--failed">
              <XCircle className="size-3.5" aria-hidden />
              فشل الرفع
            </span>
          ) : null}
        </div>

        {status !== "failed" ? (
          <div className="file-upload-progress__bar-row">
            <div
              className="file-upload-progress__bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clampedProgress}
              aria-label="تقدم الرفع"
            >
              <div
                className="file-upload-progress__bar-fill"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <span className="file-upload-progress__percent">
              {clampedProgress}%
            </span>
          </div>
        ) : (
          <div className="file-upload-progress__failed-actions">
            {errorMessage ? (
              <p className="file-upload-progress__error">{errorMessage}</p>
            ) : null}
            {onRetry ? (
              <button
                type="button"
                className="file-upload-progress__retry"
                onClick={onRetry}
              >
                إعادة المحاولة
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
