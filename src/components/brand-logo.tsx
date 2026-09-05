import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export const BRAND_LOGO_FULL = "/brand/logo.png";
export const BRAND_LOGO_ICON = "/brand/logo-icon.png";

/** Figma base spec — scaled up via size variants */
export const BRAND_LOGO_WIDTH = 138.69;
export const BRAND_LOGO_HEIGHT = 36;

type BrandLogoSize = "sm" | "md" | "lg" | "xl";

const FULL_HEIGHT: Record<BrandLogoSize, string> = {
  sm: "h-8",
  md: "h-9",
  lg: "h-12",
  xl: "h-16",
};

const FULL_WIDTH: Record<BrandLogoSize, string> = {
  sm: "w-[7.25rem]",
  md: "w-[8.668rem]",
  lg: "w-[11.56rem]",
  xl: "w-auto max-w-full",
};

const ICON_HEIGHT: Record<BrandLogoSize, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-11",
  xl: "h-14",
};

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  size?: BrandLogoSize;
  linkToHome?: boolean;
  /** Stretch the wordmark to the parent width. */
  fill?: boolean;
  /** White pill behind logo — for dark backgrounds */
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
  const src = compact ? BRAND_LOGO_ICON : BRAND_LOGO_FULL;
  const alt = "صبارة بوست";

  const img = (
    <img
      src={src}
      alt={alt}
      className={cn(
        "object-contain",
        compact
          ? cn(ICON_HEIGHT[size], "w-auto")
          : fill
            ? "h-auto w-full max-w-none"
            : cn(FULL_HEIGHT[size], FULL_WIDTH[size]),
      )}
      decoding="async"
    />
  );

  const content = (
    <div
      className={cn(
        fill ? "flex w-full items-center" : "inline-flex shrink-0 items-center",
        onDark && "rounded-lg bg-white px-3 py-2 shadow-sm",
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
        aria-label="العودة للرئيسية"
      >
        {content}
      </Link>
    );
  }

  return content;
}
