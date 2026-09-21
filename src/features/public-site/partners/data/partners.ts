import type { PublicStaticCopy } from "@/lib/i18n/public-static-copy";
import { PUBLIC_STATIC_COPY } from "@/lib/i18n/public-static-copy";

export interface Partner {
  id: string;
  title: string;
  logo?: string;
  logoAlt: string;
  initials: string;
}

export const PARTNER_LOGOS = {
  cfi: "/partners/cfi.jpg",
  ccfd: "/partners/ccfd.jpg",
  rsf: "/partners/rsf.jpg",
  euroMed: "/partners/euro-med.png",
  wacc: "/partners/wacc.png",
  boell: "/partners/boell.png",
  care: "/partners/care.png",
} as const;

type LogoKey = keyof typeof PARTNER_LOGOS;

type PartnerInput = {
  id: string;
  title: string;
  logoAlt: string;
  initials: string;
  logoKey?: LogoKey;
};

function partner({ logoKey, ...rest }: PartnerInput): Partner {
  return {
    ...rest,
    logo: logoKey ? PARTNER_LOGOS[logoKey] : undefined,
  };
}

const PARTNER_LOGO_KEYS: Record<string, LogoKey> = {
  cfi: "cfi",
  ccfd: "ccfd",
  rsf: "rsf",
  "euro-med": "euroMed",
  wacc: "wacc",
  boell: "boell",
  care: "care",
};

export function partnersFromCopy(
  list: PublicStaticCopy["partnersList"],
): Partner[] {
  return list.map((entry) =>
    partner({
      id: entry.id,
      title: entry.title,
      logoAlt: entry.logoAlt,
      initials: entry.initials,
      logoKey: PARTNER_LOGO_KEYS[entry.id],
    }),
  );
}

/** @deprecated Use partnersFromCopy(copy.partnersList) in UI */
export const FEATURED_PARTNERS: Partner[] = partnersFromCopy(
  PUBLIC_STATIC_COPY.ar.partnersList,
);

/** @deprecated Use partnersFromCopy(copy.partnersList) in UI */
export const ALL_PARTNERS: Partner[] = FEATURED_PARTNERS;
