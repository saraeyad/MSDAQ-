import { cn } from "@/lib/utils";
import { extractDomainFromUrl } from "@/lib/image-verification-utils";
import { ImageIcon, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ImagePreviewFrameProps {
  imageUrl: string | null;
}

export default function ImagePreviewFrame({ imageUrl }: ImagePreviewFrameProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"empty" | "loading" | "loaded" | "error">("empty");

  useEffect(() => {
    if (!imageUrl) {
      setStatus("empty");
      return;
    }

    setStatus("loading");
    const img = new Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = imageUrl;
  }, [imageUrl]);

  const caption = imageUrl ? extractDomainFromUrl(imageUrl) : "";

  return (
    <div className="relative mx-auto w-full max-w-sm rotate-1">
      <div
        className="absolute -end-1 -top-2 z-10 h-8 w-14 rounded-sm bg-amber-100/80 shadow-sm"
        aria-hidden
      />
      <div className="overflow-hidden rounded-sm border-8 border-white bg-white shadow-lg">
        <div className="relative aspect-[4/3] bg-muted/40">
          {status === "empty" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <ImageIcon className="size-10 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                {t("imageVerification.preview.empty")}
              </p>
            </div>
          ) : null}

          {status === "loading" ? (
            <div className="flex h-full items-center justify-center">
              <Loader className="size-8 animate-spin text-[var(--investigation-amber)]" />
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <ImageIcon className="size-10 text-trust-low/60" />
              <p className="text-xs text-trust-low">{t("imageVerification.preview.error")}</p>
            </div>
          ) : null}

          {status === "loaded" && imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div
          className={cn(
            "border-t border-dashed border-border/60 px-3 py-2 text-center font-headline text-sm text-muted-foreground",
            !caption && "text-muted-foreground/50",
          )}
        >
          {caption || t("imageVerification.preview.captionPlaceholder")}
        </div>
      </div>
    </div>
  );
}
