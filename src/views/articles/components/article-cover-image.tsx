import { cn } from "@/lib/utils";
import { Newspaper } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ArticleCoverAspect = "card" | "hero" | "featured" | "thumb";

const ASPECT_CLASSES: Record<ArticleCoverAspect, string> = {
  card: "aspect-[16/10]",
  featured: "aspect-[16/9]",
  hero: "aspect-[21/9]",
  thumb: "aspect-[4/3] h-12 w-16 shrink-0",
};

interface ArticleCoverImageProps {
  src?: string;
  alt: string;
  aspect?: ArticleCoverAspect;
  className?: string;
  imageClassName?: string;
  loading?: "lazy" | "eager";
}

export default function ArticleCoverImage({
  src,
  alt,
  aspect = "card",
  className,
  imageClassName,
  loading = "lazy",
}: ArticleCoverImageProps) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted",
        ASPECT_CLASSES[aspect],
        className,
      )}
    >
      {showPlaceholder ? (
        <div
          className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground"
          role="img"
          aria-label={t("articles.imageFallback")}
        >
          <Newspaper
            className={cn(
              "opacity-40",
              aspect === "thumb" ? "size-5" : "size-8",
            )}
            strokeWidth={1.25}
          />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={() => setFailed(true)}
          className={cn("size-full object-cover", imageClassName)}
        />
      )}
    </div>
  );
}
