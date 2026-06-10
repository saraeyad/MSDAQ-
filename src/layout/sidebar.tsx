import BrandLogo from "@/components/brand-logo";
import { useAuth } from "@/context/auth";
import useMenu, { type NavItem } from "@/hooks/useMenu";
import i18n from "@/i18n";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { NavItems, isLoading } = useMenu();
  const roleAccent =
    user?.role === "admin"
      ? "bg-accent-admin"
      : user?.role === "journalist"
        ? "bg-accent-editor"
        : "bg-secondary";
  const location = useLocation();

  const isActive = (path: string) =>
    !!path &&
    (location.pathname === path || location.pathname.startsWith(`${path}/`));

  const isItemActiveRecursively = (item: NavItem): boolean => {
    if (isActive(item.path || "")) return true;
    return item.children?.some(isItemActiveRecursively) ?? false;
  };

  const MenuItem = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const [open, setOpen] = useState(() => isItemActiveRecursively(item));
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const Icon = item.icon;
    const itemClassName = cn(
      "mb-1 flex cursor-pointer items-center justify-between rounded px-3 py-2.5 text-body-md transition-all",
      isActive(item.path || "") && !hasChildren
        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
    );
    const itemStyle = { paddingInlineStart: `${depth * 16 + 12}px` };

    const itemContent = (
      <>
        <div className="flex flex-1 items-center gap-2">
          {Icon ? <Icon size={16} strokeWidth={1.75} /> : null}
          <span className="flex-1">{t(item.key)}</span>
        </div>
        {hasChildren ? (
          <span className="ms-2">
            {open ? (
              <ChevronDown size={15} />
            ) : i18n.dir() === "ltr" ? (
              <ChevronRight size={15} />
            ) : (
              <ChevronLeft size={15} />
            )}
          </span>
        ) : null}
      </>
    );

    return (
      <div>
        {item.path ? (
          <Link to={item.path} onClick={onClose} className={itemClassName} style={itemStyle}>
            {itemContent}
          </Link>
        ) : (
          <div
            onClick={hasChildren ? () => setOpen((prev) => !prev) : onClose}
            className={itemClassName}
            style={itemStyle}
          >
            {itemContent}
          </div>
        )}

        {open && hasChildren
          ? item.children!.map((child) => (
              <MenuItem key={child.key} item={child} depth={depth + 1} />
            ))
          : null}
      </div>
    );
  };

  return (
    <aside className="relative z-50 flex h-screen min-w-72 flex-col overflow-auto border-e border-border bg-sidebar px-4 pb-4 hide-scrollbar md:w-72">
      <div className={cn("absolute inset-x-0 top-0 h-1", roleAccent)} />
      <div className="sticky top-0 border-b border-border bg-sidebar py-5">
        <div className="flex items-center justify-between">
          <BrandLogo />
          {onClose ? (
            <button type="button" onClick={onClose} className="md:hidden">
              <X className="size-5 text-muted-foreground" />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 pt-4">
        {isLoading ? (
          <p className="px-3 text-body-md text-muted-foreground">{t("GENERAL.LOADING")}</p>
        ) : (
          NavItems.map((item) => <MenuItem key={item.key} item={item} />)
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
