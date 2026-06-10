import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export const BRAND_LOGO_FULL = "/brand/logo.png";
export const BRAND_LOGO_ICON = "/brand/logo-icon.png";

type BrandLogoVariant = "full" | "icon";
type BrandLogoSize = "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  variant?: BrandLogoVariant;
  /** @deprecated Use `variant="icon"` instead */
  showWordmark?: boolean;
  size?: BrandLogoSize;
  linkToHome?: boolean;
}

const FULL_SIZE_CLASS: Record<BrandLogoSize, string> = {
  sm: "h-8",
  md: "h-10 md:h-11",
  lg: "h-14 md:h-16",
  xl: "h-20 md:h-28",
};

const ICON_SIZE_CLASS: Record<BrandLogoSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
  xl: "size-20",
};

export default function BrandLogo({
  className,
  imageClassName,
  variant,
  showWordmark = true,
  size = "md",
  linkToHome = true,
}: BrandLogoProps) {
  const resolvedVariant = variant ?? (showWordmark ? "full" : "icon");
  const src = resolvedVariant === "full" ? BRAND_LOGO_FULL : BRAND_LOGO_ICON;
  const alt = resolvedVariant === "full" ? "MISDAQ — مصداق" : "MISDAQ";

  const content = (
    <div className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-auto object-contain object-start",
          resolvedVariant === "full" ? FULL_SIZE_CLASS[size] : ICON_SIZE_CLASS[size],
          imageClassName
        )}
        decoding="async"
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link to={ROUTES.HOME} className="inline-flex transition-opacity hover:opacity-85">
        {content}
      </Link>
    );
  }

  return content;
}
