import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

interface FileInputProps {
  id?: string;
  accept?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  chooseLabel?: string;
  emptyLabel?: string;
  showImagePreview?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function FileInput({
  id,
  accept,
  value = null,
  onChange,
  disabled = false,
  className,
  chooseLabel = "اختر ملف",
  emptyLabel = "لم يُختَر ملف بعد",
  showImagePreview = true,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!value || !showImagePreview || !isImageFile(value)) return null;
    return URL.createObjectURL(value);
  }, [value, showImagePreview]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null);
  };

  const clear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("file-input", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={handleChange}
      />

      {!value ? (
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className={cn(
            "file-input__empty flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/15 px-4 py-4 text-sm transition-colors",
            !disabled && "hover:border-primary/40 hover:bg-muted/25",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <span className="flex items-center gap-2 font-medium text-foreground">
            <Upload className="size-4 shrink-0" />
            {chooseLabel}
          </span>
          <span className="text-xs text-muted-foreground">{emptyLabel}</span>
        </button>
      ) : (
        <div
          className={cn(
            "file-input__selected flex items-center gap-3 rounded-md border border-border bg-muted/15 p-3",
            disabled && "opacity-50",
          )}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="file-input__preview size-14 shrink-0 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="file-input__preview file-input__preview--placeholder flex size-14 shrink-0 items-center justify-center rounded-md border border-border bg-card">
              {isImageFile(value) ? (
                <ImageIcon className="size-5 text-muted-foreground" />
              ) : (
                <FileText className="size-5 text-muted-foreground" />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground" title={value.name}>
              {value.name}
            </p>
            <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={openPicker}
            >
              تغيير
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={clear}
              className="size-8 text-muted-foreground"
              aria-label="إزالة الملف"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
