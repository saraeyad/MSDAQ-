import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AiImageDetectionSchemaType } from "@/schemas/ai-image-detection-schema";
import { Loader, ScanSearch, Upload } from "lucide-react";
import { useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ImagePreviewFrame from "./image-preview-frame";

interface ImageFileInputFormProps {
  form: UseFormReturn<AiImageDetectionSchemaType>;
  onSubmit: (data: AiImageDetectionSchemaType) => void;
  loading: boolean;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
}

export default function ImageFileInputForm({
  form,
  onSubmit,
  loading,
  previewUrl,
  onFileChange,
}: ImageFileInputFormProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedFile = form.watch("image_file");

  const handleFileSelect = (file: File | null) => {
    form.setValue("image_file", file as File, { shouldValidate: true });
    onFileChange(file);
  };

  return (
    <div className="relative rounded-xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/55 backdrop-blur-[2px]">
          <p className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {t("imageVerification.ai.checking")}
          </p>
        </div>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image_file">{t("imageVerification.ai.inputLabel")}</Label>
          <input
            ref={inputRef}
            id="image_file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              handleFileSelect(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 sm:w-auto"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="size-4" />
            {selectedFile instanceof File
              ? selectedFile.name
              : t("imageVerification.ai.uploadButton")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("imageVerification.ai.uploadHint")}</p>
          {form.formState.errors.image_file?.message ? (
            <p className="text-sm text-trust-low">
              {String(form.formState.errors.image_file.message)}
            </p>
          ) : null}
        </div>

        <ImagePreviewFrame imageUrl={previewUrl} />

        <div className="flex justify-end border-t border-border/50 pt-4">
          <Button type="submit" disabled={loading || !selectedFile} className="w-full sm:w-auto">
            {loading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <ScanSearch className="size-4" />
            )}
            {loading ? t("imageVerification.ai.checking") : t("imageVerification.ai.checkButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}
