export interface Partner {
  id: string;
  title: string;
  logo?: string;
  logoAlt: string;
  initials: string;
}

export const PARTNER_LOGOS = {
  unTrustFund: "/partners/un-trust-fund.png",
  ukGov: "/partners/uk-gov.png",
  crs: "/partners/crs.png",
  aisha: "/partners/aisha.png",
  birzeit: "/partners/birzeit.png",
  wacc: "/partners/wacc.png",
  ndc: "/partners/ndc.png",
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

/** شريط الشعارات — للصفحة الرئيسية ومن نحن */
export const FEATURED_PARTNERS: Partner[] = [
  partner({
    id: "un-trust",
    title: "صندوق الأمم المتحدة لإنهاء العنف ضد المرأة",
    logoAlt: "United Nations Trust Fund to End Violence Against Women",
    initials: "UN",
    logoKey: "unTrustFund",
  }),
  partner({
    id: "uk-gov",
    title: "الحكومة البريطانية",
    logoAlt: "UK Government",
    initials: "UK",
    logoKey: "ukGov",
  }),
  partner({
    id: "crs",
    title: "منظمة الإغاثة الكاثوليكية",
    logoAlt: "Catholic Relief Services",
    initials: "CRS",
    logoKey: "crs",
  }),
  partner({
    id: "aisha",
    title: "جمعية عايشة لحماية المرأة والطفل",
    logoAlt: "Aisha Association for Woman and Child Protection",
    initials: "عايشة",
    logoKey: "aisha",
  }),
  partner({
    id: "birzeit",
    title: "جامعة بيرزيت",
    logoAlt: "Birzeit University",
    initials: "BZU",
    logoKey: "birzeit",
  }),
  partner({
    id: "wacc",
    title: "الجمعية العالمية للاتصالات المسيحية",
    logoAlt: "WACC — communication for all",
    initials: "WACC",
    logoKey: "wacc",
  }),
  partner({
    id: "ndc",
    title: "مركز تطوير المؤسسات الأهلية الفلسطينية",
    logoAlt: "NGO Development Center",
    initials: "NDC",
    logoKey: "ndc",
  }),
];

/** قائمة الشركاء الكاملة — صفحة شركاؤنا (شعارات فقط) */
export const ALL_PARTNERS: Partner[] = FEATURED_PARTNERS;
