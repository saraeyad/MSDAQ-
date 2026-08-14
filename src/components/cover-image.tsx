import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";
import { useMemo, useState } from "react";

interface CoverImageProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
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
      loading="lazy"
      decoding="async"
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
}: {
  article: {
    cover_image?: string | null;
    images?: { thumb?: string; full?: string }[];
  };
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}) {
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
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

export function articleCoverUrl(id: number, index = 0): string {
  return `https://picsum.photos/seed/cdmc-${id}-${index}/1200/675`;
}
