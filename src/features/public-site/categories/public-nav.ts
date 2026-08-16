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
const STATIC_NAV_TAIL: PublicNavItem[] = [
  { type: "link", to: ROUTES.RUYA, label: "رؤيا" },
  {
    type: "dropdown",
    label: "إصدارات",
    paths: PUBLICATION_PATHS,
    items: [
      { to: ROUTES.PUBLICATIONS, label: "جميع الإصدارات" },
      { to: ROUTES.PUBLICATIONS_REPORTS, label: "تقارير" },
      { to: ROUTES.PUBLICATIONS_BOOKS, label: "كتب" },
    ],
  },
  {
    type: "dropdown",
    label: "عن المركز",
    paths: ABOUT_PATHS,
    items: [
      { to: ROUTES.ABOUT, label: "من نحن" },
      { to: ROUTES.PARTNERS, label: "شركاؤنا" },
      { to: ROUTES.DATA_INFO, label: "معلومات وبيانات" },
    ],
  },
];

const STATIC_FOOTER_LINKS = [
  { to: ROUTES.HOME, label: "الرئيسية" },
  { to: ROUTES.RUYA, label: "رؤيا" },
  { to: ROUTES.PUBLICATIONS, label: "إصدارات ودراسات" },
  { to: ROUTES.DATA_INFO, label: "معلومات وبيانات" },
];

function buildCategoriesDropdown(
  categories: PublicCategory[],
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
    label: "الأقسام",
    paths,
    items,
  };
}

export function buildPublicNavItems(
  categories: PublicCategory[],
): PublicNavItem[] {
  const categoriesMenu = buildCategoriesDropdown(categories);

  return [
    { type: "link", to: ROUTES.HOME, label: "الرئيسية", end: true },
    ...(categoriesMenu ? [categoriesMenu] : []),
    ...STATIC_NAV_TAIL,
  ];
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

export function buildPublicFooterLinks(categories: PublicCategory[]) {
  const categoryLinks: { to: string; label: string }[] = [];

  for (const category of categories) {
    categoryLinks.push({
      to: categoryPath(category.slug),
      label: category.name_ar,
    });

    for (const child of category.children ?? []) {
      categoryLinks.push({
        to: categoryPath(child.slug),
        label: `\u2003${child.name_ar}`,
      });
    }
  }

  return [
    STATIC_FOOTER_LINKS[0],
    ...categoryLinks,
    ...STATIC_FOOTER_LINKS.slice(1),
  ];
}

export { STATIC_FOOTER_LINKS };
