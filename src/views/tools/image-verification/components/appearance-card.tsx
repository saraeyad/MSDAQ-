import { cn } from "@/lib/utils";
import { getCardRotation, getDomainAccent } from "@/lib/image-verification-utils";
import type { ImageAppearance } from "@/types/image-verification";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AppearanceCardProps {
  appearance: ImageAppearance;
}

export default function AppearanceCard({ appearance }: AppearanceCardProps) {
  const { t } = useTranslation();
  const rotation = getCardRotation(appearance.domain);
  const borderAccent = getDomainAccent(appearance.domain);

  return (
    <article
      className="transition-transform duration-300 hover:-translate-y-1"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border border-border/60 border-s-[3px] bg-background/90 shadow-sm transition-shadow duration-300 hover:shadow-md",
          borderAccent,
        )}
      >
      <span
        className="absolute start-1/2 top-0 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--investigation-amber)] shadow-sm"
        aria-hidden
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={appearance.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {appearance.logo ? (
          <div className="absolute end-2 top-2 flex size-7 items-center justify-center rounded-full border border-border bg-white shadow-sm">
            <img src={appearance.logo} alt="" className="size-4 object-contain" />
          </div>
        ) : null}
      </div>

      <div className="space-y-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {appearance.domain}
          </span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-[var(--investigation-amber)]">
            {appearance.date}
          </span>
        </div>
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {appearance.title}
        </h4>
        <a
          href={appearance.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-secondary transition-all group-hover:gap-2"
        >
          {t("imageVerification.viewSource")}
          <ExternalLink className="size-3" />
        </a>
      </div>
      </div>
    </article>
  );
}
