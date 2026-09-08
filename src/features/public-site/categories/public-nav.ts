import type { PublicCopy } from "@/lib/i18n/public-dictionary";
import { categoryPath, ROUTES } from "@/router/routes";
import type { PublicCategory } from "@/types";

export type PublicNavLinkItem = {
  type: "link";
  to: string;
  label: string;
  end?: boolean;
  matchPaths?: string[];
};

export type PublicNavMenuLink = {
  to: string;
  label: string;
  children?: { to: string; label: string }[];
};

export type PublicNavDropdownItem = {
  type: "dropdown";
  label: string;
  paths: string[];
  items: PublicNavMenuLink[];
};

export type PublicNavItem = PublicNavLinkItem | PublicNavDropdownItem;

const PUBLICATION_PATHS = [
  ROUTES.PUBLICATIONS,
  ROUTES.PUBLICATIONS_REPORTS,
  ROUTES.PUBLICATIONS_BOOKS,
];

const ABOUT_PATHS = [
  ROUTES.ABOUT,
  ROUTES.PARTNERS,
  ROUTES.DATA_INFO,
];

/** Editorial / static pages — not CMS categories. */
function buildStaticNavTail(nav: PublicCopy["nav"]): PublicNavItem[] {
  return [
    { type: "link", to: ROUTES.RUYA, label: nav.vision },
    {
      type: "dropdown",
      label: nav.publications,
      paths: PUBLICATION_PATHS,
      items: [
        { to: ROUTES.PUBLICATIONS, label: nav.allPublications },
        { to: ROUTES.PUBLICATIONS_REPORTS, label: nav.reports },
        { to: ROUTES.PUBLICATIONS_BOOKS, label: nav.books },
      ],
    },
    {
      type: "dropdown",
      label: nav.aboutCenter,
      paths: ABOUT_PATHS,
      items: [
        { to: ROUTES.ABOUT, label: nav.aboutUs },
        { to: ROUTES.PARTNERS, label: nav.partners },
        { to: ROUTES.DATA_INFO, label: nav.dataInfo },
      ],
    },
  ];
}

function buildStaticFooterLinks(nav: PublicCopy["footer"]) {
  return [
    { to: ROUTES.HOME, label: nav.home },
    { to: ROUTES.RUYA, label: nav.vision },
    { to: ROUTES.PUBLICATIONS, label: nav.publicationsStudies },
    { to: ROUTES.DATA_INFO, label: nav.dataInfo },
  ];
}

const STATIC_FOOTER_LINKS = buildStaticFooterLinks({
  home: "الرئيسية",
  vision: "رؤيا",
  publicationsStudies: "إصدارات ودراسات",
  dataInfo: "معلومات وبيانات",
  tagline: "",
  sections: "",
  info: "",
  location: "",
  mapHeading: "",
  mapTitle: "",
  shareFeedback: "",
  copyright: () => "",
  aboutUs: "",
  partners: "",
  sitePolicy: "",
  terms: "",
  verificationTools: "",
});

function buildCategoriesDropdown(
  categories: PublicCategory[],
  sectionsLabel: string,
): PublicNavDropdownItem | null {
  if (categories.length === 0) return null;

  const paths: string[] = [];
  const items: PublicNavMenuLink[] = [];

  for (const category of categories) {
    const parentPath = categoryPath(category.slug);
    paths.push(parentPath);

    const children = (category.children ?? []).map((child) => {
      const childPath = categoryPath(child.slug);
      paths.push(childPath);
      return { to: childPath, label: child.name_ar };
    });

    items.push({
      to: parentPath,
      label: category.name_ar,
      children: children.length ? children : undefined,
    });
  }

  return {
    type: "dropdown",
    label: sectionsLabel,
    paths,
    items,
  };
}

export function buildPublicNavItems(
  categories: PublicCategory[],
  nav?: PublicCopy["nav"],
): PublicNavItem[] {
  const labels = nav ?? {
    home: "الرئيسية",
    sections: "الأقسام",
    vision: "رؤيا",
    publications: "إصدارات",
    allPublications: "جميع الإصدارات",
    reports: "تقارير",
    books: "كتب",
    aboutCenter: "عن المركز",
    aboutUs: "من نحن",
    partners: "شركاؤنا",
    dataInfo: "معلومات وبيانات",
    login: "",
    workspace: "",
    menu: "",
    openMenu: "",
    subcategories: "",
    searchPlaceholder: "",
  };

  const categoriesMenu = buildCategoriesDropdown(categories, labels.sections);

  return [
    { type: "link", to: ROUTES.HOME, label: labels.home, end: true },
    ...(categoriesMenu ? [categoriesMenu] : []),
    ...buildStaticNavTail(labels),
  ];
}

export function buildStaticFooterLinksFromCopy(footer: PublicCopy["footer"]) {
  return buildStaticFooterLinks(footer);
}

export function isPublicNavLinkActive(
  item: PublicNavLinkItem,
  pathname: string,
): boolean {
  if (item.matchPaths?.length) {
    return item.matchPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
  }
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export type PublicFooterSection = {
  to: string;
  label: string;
  children: { to: string; label: string }[];
};

function rootPublicCategories(categories: PublicCategory[]): PublicCategory[] {
  const nestedIds = new Set<number>();

  const walk = (nodes: PublicCategory[]) => {
    for (const node of nodes) {
      for (const child of node.children ?? []) {
        nestedIds.add(child.id);
        walk(child.children ?? []);
      }
    }
  };

  walk(categories);
  const roots = categories.filter((category) => !nestedIds.has(category.id));
  return roots.length > 0 ? roots : categories;
}

/** Top-level sections only — children stay grouped under the parent. */
export function buildPublicFooterSections(
  categories: PublicCategory[],
): PublicFooterSection[] {
  return rootPublicCategories(categories).map((category) => ({
    to: categoryPath(category.slug),
    label: category.name_ar,
    children: (category.children ?? []).map((child) => ({
      to: categoryPath(child.slug),
      label: child.name_ar,
    })),
  }));
}

export { STATIC_FOOTER_LINKS };
