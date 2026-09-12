import { usePublicCopy } from "@/context/locale";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export const BRAND_LOGO_FULL = "/brand/sabbara-post.png?v=3";
export const BRAND_LOGO_ICON = "/brand/sabbara-post-icon.png?v=3";

type BrandLogoSize = "sm" | "md" | "lg" | "xl";

const FULL_HEIGHT: Record<BrandLogoSize, string> = {
  sm: "h-14",
  md: "h-16",
  lg: "h-[5.5rem]",
  xl: "h-[7.25rem]",
};

const FULL_WIDTH: Record<BrandLogoSize, string> = {
  sm: "w-auto max-w-[8.75rem]",
  md: "w-auto max-w-[10.5rem]",
  lg: "w-auto max-w-[13rem]",
  xl: "w-auto max-w-[14.5rem]",
};

const ICON_HEIGHT: Record<BrandLogoSize, string> = {
  sm: "h-11",
  md: "h-12",
  lg: "h-14",
  xl: "h-16",
};

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  size?: BrandLogoSize;
  linkToHome?: boolean;
  /** Stretch the wordmark to the parent width. */
  fill?: boolean;
  /** Paper plate behind the lockup — for dark backgrounds */
  onDark?: boolean;
}

export function BrandLogo({
  className,
  compact = false,
  size = "md",
  linkToHome = true,
  fill = false,
  onDark = false,
}: BrandLogoProps) {
  const { brand } = usePublicCopy();
  const src = compact ? BRAND_LOGO_ICON : BRAND_LOGO_FULL;

  const img = (
    <img
      src={src}
      alt={brand.name}
      className={cn(
        "brand-logo__img object-contain object-center",
        compact
          ? cn(ICON_HEIGHT[size], "w-auto")
          : fill
            ? "h-auto w-full max-w-none"
            : cn(FULL_HEIGHT[size], FULL_WIDTH[size]),
      )}
      loading="eager"
      decoding="async"
    />
  );

  const content = (
    <div
      className={cn(
        "brand-logo inline-flex shrink-0 items-center",
        fill && "w-full",
        onDark && "brand-logo--on-dark",
        className,
      )}
    >
      {img}
    </div>
  );

  if (linkToHome) {
    return (
      <Link
        to={ROUTES.HOME}
        className="inline-flex transition-opacity hover:opacity-85"
        aria-label={brand.homeAria}
      >
        {content}
      </Link>
    );
  }

  return content;
}
