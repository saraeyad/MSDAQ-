import { cn } from "@/lib/utils";
import type { Partner } from "@/features/public-site/partners/data/partners";
import { useState } from "react";

interface PartnerLogoProps {
  partner: Partner;
  className?: string;
  size?: "sm" | "md" | "lg" | "card" | "strip";
}

const SIZE: Record<NonNullable<PartnerLogoProps["size"]>, string> = {
  sm: "h-10 max-w-[7rem]",
  md: "h-16 max-w-[11rem]",
  lg: "h-24 max-w-[16rem]",
  card: "h-20 max-w-[14rem]",
  strip: "h-auto w-auto max-h-[5.5rem] max-w-full",
};

export function PartnerLogo({
  partner,
  className,
  size = "md",
}: PartnerLogoProps) {
  const [failed, setFailed] = useState(!partner.logo);

  if (failed || !partner.logo) {
    return (
      <div
        className={cn(
          "partners-logo-fallback flex items-center justify-center rounded-xl px-4 py-3",
          size === "card" && "partners-logo-fallback--card",
          SIZE[size],
          className,
        )}
        title={partner.title}
      >
        <span className="text-center font-bold tracking-wide">
          {partner.initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={partner.logo}
      alt={partner.logoAlt}
      title={partner.title}
      onError={() => setFailed(true)}
      className={cn("w-auto object-contain", SIZE[size], className)}
    />
  );
}

export function PartnerCmcBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-12 w-14 shrink-0 items-center justify-center bg-[#6d6d6d] text-xs font-bold tracking-wide text-white",
        className,
      )}
    >
      CMC
    </div>
  );
}
