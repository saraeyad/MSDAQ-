import { imageLoadProps } from "@/lib/media";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import { useMemo, useState } from "react";

interface CoverImageProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
}

function CoverFallback({
  className,
  fallbackClassName,
}: Pick<CoverImageProps, "className" | "fallbackClassName">) {
  return (
    <div
      className={cn(
        "size-full bg-gradient-to-br from-primary/70 via-primary/50 to-amber-300/40",
        fallbackClassName,
        className,
      )}
    />
  );
}

export function CoverImage({
  src,
  alt = "",
  className,
  fallbackClassName,
  priority = false,
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);

  if (!resolved || failed) {
    return (
      <CoverFallback className={className} fallbackClassName={fallbackClassName} />
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      {...imageLoadProps(priority)}
      onError={() => setFailed(true)}
    />
  );
}

/** Tries cover_image then gallery images when a URL fails to load. */
export function PublicArticleCover({
  article,
  alt = "",
  className,
  fallbackClassName,
  priority = false,
}: {
  article: {
    title?: string;
    cover_image?: string | null;
    cover_description?: string | null;
    images?: { thumb?: string; full?: string }[];
  };
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
}) {
  const resolvedAlt =
    alt || article.cover_description?.trim() || article.title || "";
  const candidates = useMemo(() => {
    const raw = [
      article.cover_image,
      ...(article.images?.flatMap((image) => [image.full, image.thumb]) ?? []),
    ];
    const resolved = raw
      .map(resolveMediaUrl)
      .filter((url): url is string => Boolean(url));
    return [...new Set(resolved)];
  }, [article.cover_image, article.images]);

  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src || index >= candidates.length) {
    return (
      <CoverFallback className={className} fallbackClassName={fallbackClassName} />
    );
  }

  return (
    <img
      src={src}
      alt={resolvedAlt}
      className={className}
      {...imageLoadProps(priority)}
      onError={() => setIndex((current) => current + 1)}
    />
  );
}
