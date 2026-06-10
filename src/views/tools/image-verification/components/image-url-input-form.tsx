import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ImageVerificationSchemaType } from "@/schemas/image-verification-schema";
import { Loader, ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ImagePreviewFrame from "./image-preview-frame";

interface ImageUrlInputFormProps {
  form: UseFormReturn<ImageVerificationSchemaType>;
  onSubmit: (data: ImageVerificationSchemaType) => void;
  loading: boolean;
  previewUrl: string | null;
  onPreviewUrlChange: (url: string | null) => void;
}

export default function ImageUrlInputForm({
  form,
  onSubmit,
  loading,
  previewUrl,
  onPreviewUrlChange,
}: ImageUrlInputFormProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const imageUrl = form.watch("image_url");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (imageUrl && new URL(imageUrl)) {
          onPreviewUrlChange(imageUrl);
        } else {
          onPreviewUrlChange(null);
        }
      } catch {
        onPreviewUrlChange(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [imageUrl, onPreviewUrlChange]);

  return (
    <div className="relative rounded-xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/55 backdrop-blur-[2px]">
          <p className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {t("imageVerification.checking")}
          </p>
        </div>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image_url">{t("imageVerification.inputLabel")}</Label>
          <div
            className={cn(
              "relative rounded-lg p-3 transition-shadow",
              focused && "shadow-[0_0_0_3px_var(--investigation-glow)]",
            )}
          >
            <span className="pointer-events-none absolute start-2 top-2 size-4 border-s-2 border-t-2 border-[var(--investigation-amber)]" />
            <span className="pointer-events-none absolute end-2 top-2 size-4 border-e-2 border-t-2 border-[var(--investigation-amber)]" />
            <span className="pointer-events-none absolute bottom-2 start-2 size-4 border-s-2 border-b-2 border-[var(--investigation-amber)]" />
            <span className="pointer-events-none absolute bottom-2 end-2 size-4 border-e-2 border-b-2 border-[var(--investigation-amber)]" />
            <Input
              id="image_url"
              placeholder={t("imageVerification.placeholder")}
              className="border-border/80 bg-background/50"
              {...form.register("image_url")}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>
          {form.formState.errors.image_url ? (
            <p className="text-sm text-trust-low">{form.formState.errors.image_url.message}</p>
          ) : null}
        </div>

        <ImagePreviewFrame imageUrl={previewUrl} />

        <div className="flex justify-end border-t border-border/50 pt-4">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <ScanSearch className="size-4" />
            )}
            {loading ? t("imageVerification.checking") : t("imageVerification.checkButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}
