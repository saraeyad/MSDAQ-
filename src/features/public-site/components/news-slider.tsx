import { PublicArticleCover } from "@/components/cover-image";
import { mediaTypeLabel } from "@/lib/media-labels";
import { cn } from "@/lib/utils";
import type { PublicArticle } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface NewsSliderProps {
  articles: PublicArticle[];
  className?: string;
  autoPlayMs?: number;
  variant?: "default" | "banner";
  fullWidth?: boolean;
}

export function NewsSlider({
  articles,
  className,
  autoPlayMs = 6000,
  variant = "default",
  fullWidth = false,
}: NewsSliderProps) {
  const slides = articles.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = window.setInterval(() => goTo(index + 1), autoPlayMs);
    return () => window.clearInterval(timer);
  }, [autoPlayMs, goTo, index, paused, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          variant === "banner" ? "h-56 md:h-80 lg:h-[28rem]" : "aspect-video",
          !fullWidth && "rounded-xl",
          className,
        )}
      >
        لا توجد أخبار للعرض
      </div>
    );
  }

  const current = slides[index];
  const slideHeight =
    variant === "banner" ? "h-56 md:h-80 lg:h-[28rem]" : "aspect-video";

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden",
        !fullWidth && "rounded-xl border-2 border-border",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        to={`/articles/${current.id}`}
        className={cn("relative block w-full", slideHeight)}
      >
        <PublicArticleCover
          article={current}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0",
            fullWidth ? "container-page p-6 md:p-10" : "p-6 md:p-10",
          )}
        >
          <span className="inline-block rounded-md border border-primary/40 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {current.category?.name_ar ?? mediaTypeLabel(current.media_type)}
          </span>
          <h2 className="mt-3 max-w-3xl font-headline text-xl font-bold leading-snug text-white md:text-3xl lg:text-4xl">
            {current.title}
          </h2>
          {current.description && (
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/90 md:text-base">
              {current.description}
            </p>
          )}
          <p className="mt-3 text-xs text-white/70">
            {new Date(current.published_at).toLocaleDateString("ar")}
          </p>
        </div>
      </Link>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="الخبر السابق"
            onClick={() => goTo(index - 1)}
            className="absolute start-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100 md:start-6"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-label="الخبر التالي"
            onClick={() => goTo(index + 1)}
            className="absolute end-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100 md:end-6"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="absolute bottom-5 start-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`الانتقال إلى الخبر ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-white/60 hover:bg-white",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
