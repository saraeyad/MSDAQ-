import { PERMISSIONS } from "@/router/permissions";
import { ROUTES } from "@/router/routes";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  FileText,
  FolderOpen,
  FolderTree,
  Newspaper,
  Shield,
  Users,
  Wrench,
} from "lucide-react";

export type StaffNavGroup = "newsroom" | "admin" | "system";

export interface StaffNavItem {
  to: string;
  label: string;
  pageTitle: string;
  icon: LucideIcon;
  group: StaffNavGroup;
  end?: boolean;
  permission?: string;
  /** Any of these permissions grants nav visibility. */
  permissions?: string[];
  superAdminOnly?: boolean;
}

export const STAFF_ORG_LABEL = "مركز التنمية و الاعلام المجتمعي";

export const STAFF_NAV_GROUPS: Record<StaffNavGroup, string> = {
  newsroom: "غرفة الأخبار",
  admin: "الإدارة",
  system: "النظام",
};

/** Newsroom first (primary workspace), then admin-only tools. */
export const STAFF_NAV_ITEMS: StaffNavItem[] = [
  {
    to: ROUTES.NEWSROOM_ARTICLES,
    label: "المقالات",
    pageTitle: "المقالات",
    icon: FileText,
    group: "newsroom",
    permission: PERMISSIONS.VIEW_ARTICLES,
  },
  {
    to: ROUTES.NEWSROOM_TOOLS,
    label: "الأدوات",
    pageTitle: "الأدوات",
    icon: Wrench,
    group: "newsroom",
    permission: PERMISSIONS.ACCESS_TOOLS,
  },
  {
    to: ROUTES.NEWSROOM_CALENDAR,
    label: "التقويم",
    pageTitle: "التقويم التحريري",
    icon: Calendar,
    group: "newsroom",
    permissions: [
      PERMISSIONS.VIEW_TASKS,
      PERMISSIONS.VIEW_EVENTS,
      PERMISSIONS.VIEW_ALL_CALENDAR,
    ],
  },
  {
    to: ROUTES.NEWSROOM_LIBRARY,
    label: "المكتبة",
    pageTitle: "المكتبة",
    icon: FolderOpen,
    group: "newsroom",
    permission: PERMISSIONS.VIEW_LIBRARY,
  },
  {
    to: ROUTES.ADMIN,
    label: "لوحة الإدارة",
    pageTitle: "لوحة الإدارة",
    icon: Newspaper,
    group: "admin",
    end: true,
    permission: PERMISSIONS.VIEW_ADMIN_DASHBOARD,
  },
  {
    to: ROUTES.ADMIN_CATEGORIES,
    label: "التصنيفات",
    pageTitle: "التصنيفات",
    icon: FolderTree,
    group: "admin",
    permission: PERMISSIONS.VIEW_CATEGORIES,
  },
  {
    to: ROUTES.ADMIN_TEAM,
    label: "الفريق",
    pageTitle: "إدارة الفريق",
    icon: Users,
    group: "system",
    superAdminOnly: true,
  },
  {
    to: ROUTES.ADMIN_ROLES,
    label: "الأدوار والصلاحيات",
    pageTitle: "الأدوار والصلاحيات",
    icon: Shield,
    group: "system",
    superAdminOnly: true,
  },
];

const GROUP_ORDER: StaffNavGroup[] = ["newsroom", "admin", "system"];

export function groupStaffNavItems(items: StaffNavItem[]) {
  const groups: Record<StaffNavGroup, StaffNavItem[]> = {
    newsroom: [],
    admin: [],
    system: [],
  };
  for (const item of items) {
    groups[item.group].push(item);
  }
  return GROUP_ORDER.map((key) => ({ key, items: groups[key] })).filter(
    (g) => g.items.length > 0,
  );
}

export function getStaffPageTitle(pathname: string): string {
  if (pathname.startsWith(ROUTES.NEWSROOM_ARTICLE_NEW)) {
    return "مقال جديد";
  }
  if (pathname.includes("/newsroom/articles/") && pathname.includes("/edit")) {
    return "تعديل المقال";
  }
  if (/^\/newsroom\/articles\/\d+/.test(pathname)) {
    return "عرض المقال";
  }
  if (pathname.startsWith("/newsroom/tools/")) {
    return "الأدوات";
  }

  const match = STAFF_NAV_ITEMS.find((item) => {
    if (item.to === ROUTES.ADMIN) {
      return pathname === item.to;
    }
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });

  return match?.pageTitle ?? "غرفة الأخبار";
}

export function getVisibleStaffNav(
  permissions: string[],
  isSuperAdmin: boolean,
): StaffNavItem[] {
  return STAFF_NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.permissions?.length) {
      if (!item.permissions.some((p) => permissions.includes(p))) return false;
    } else if (item.permission && !permissions.includes(item.permission)) {
      return false;
    }
    return true;
  });
}

export function isNewsroomPath(pathname: string): boolean {
  return pathname.startsWith(ROUTES.NEWSROOM);
}

export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ROUTES.ADMIN);
}
