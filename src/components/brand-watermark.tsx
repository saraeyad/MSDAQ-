import { cn } from "@/lib/utils";
import { BRAND_LOGO_ICON } from "./brand-logo";

interface BrandWatermarkProps {
  className?: string;
  opacity?: "subtle" | "medium";
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASS = {
  sm: "size-24",
  md: "size-40",
  lg: "size-56",
  xl: "size-72 md:size-96",
} as const;

export default function BrandWatermark({
  className,
  opacity = "subtle",
  size = "lg",
}: BrandWatermarkProps) {
  return (
    <img
      src={BRAND_LOGO_ICON}
      alt=""
      aria-hidden
      className={cn(
        "pointer-events-none select-none object-contain",
        SIZE_CLASS[size],
        opacity === "subtle" ? "opacity-[0.06]" : "opacity-[0.12]",
        className
      )}
    />
  );
}
