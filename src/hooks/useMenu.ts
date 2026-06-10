import { useAuth } from "@/context/auth";
import { ROUTES } from "@/router/routes";
import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import type { ElementType } from "react";

export type NavItem = {
  key: string;
  path?: string;
  icon?: ElementType;
  children?: NavItem[];
};

function useMenu() {
  const { user } = useAuth();

  const adminItems: NavItem[] = [
    {
      key: "MENU.ADMIN_DASHBOARD",
      path: ROUTES.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      key: "MENU.JOURNALIST_REQUESTS",
      path: ROUTES.ADMIN_JOURNALIST_REQUESTS,
      icon: UserPlus,
    },
    {
      key: "MENU.DISCUSSION_MODERATION",
      path: ROUTES.ADMIN_DISCUSSION,
      icon: MessageSquare,
    },
  ];

  const journalistItems: NavItem[] = [
    {
      key: "MENU.JOURNALIST_DASHBOARD",
      path: ROUTES.JOURNALIST_DASHBOARD,
      icon: LayoutDashboard,
    },
    { key: "MENU.MY_ARTICLES", path: ROUTES.JOURNALIST_ARCHIVE, icon: Newspaper },
    {
      key: "MENU.SMART_EDITOR",
      path: ROUTES.JOURNALIST_EDITOR,
      icon: FileText,
    },
  ];

  const normalUserItems: NavItem[] = [
    {
      key: "MENU.REQUEST_JOURNALIST",
      path: ROUTES.JOURNALIST_APPLY,
      icon: UserPlus,
    },
    { key: "MENU.HOME", path: ROUTES.HOME, icon: Newspaper },
    { key: "MENU.ARTICLES", path: ROUTES.ARTICLES, icon: FileText },
    { key: "MENU.DISCUSSION", path: ROUTES.DISCUSSION, icon: MessageSquare },
    { key: "MENU.CREDIBILITY", path: ROUTES.CREDIBILITY, icon: ShieldCheck },
  ];

  const NavItems =
    user?.role === "admin"
      ? adminItems
      : user?.role === "journalist"
        ? journalistItems
        : normalUserItems;

  return { NavItems, isLoading: false };
}

export default useMenu;
