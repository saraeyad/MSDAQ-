import { SiteHeaderSearch } from "@/components/site-header-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  buildPublicNavItems,
  isPublicNavLinkActive,
  type PublicNavDropdownItem,
  type PublicNavItem,
  type PublicNavLinkItem,
} from "@/features/public-site/categories/public-nav";
import { usePublicCategories } from "@/hooks/usePublicCategories";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";

function isDropdownActive(paths: string[], pathname: string) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function NavDropdown({ item }: { item: PublicNavDropdownItem }) {
  const { pathname } = useLocation();
  const active = isDropdownActive(item.paths, pathname);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={cn(
          "nav-dropdown-trigger outline-none",
          active && "nav-dropdown-trigger-active",
        )}
      >
        {item.label}
        <ChevronDown className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={6}
        className="min-w-44"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {item.items.map((child) => (
          <DropdownMenuItem key={child.to} asChild>
            <Link
              to={child.to}
              className={cn(
                pathname === child.to && "text-primary font-medium",
              )}
            >
              {child.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavLinkItem({ item }: { item: PublicNavLinkItem }) {
  const { pathname } = useLocation();
  const active = isPublicNavLinkActive(item, pathname);

  return (
    <Link
      to={item.to}
      className={active ? "nav-link nav-link-active" : "nav-link"}
    >
      {item.label}
    </Link>
  );
}

function useSiteNavItems(): PublicNavItem[] {
  const { data: categories = [] } = usePublicCategories();

  return useMemo(() => buildPublicNavItems(categories), [categories]);
}

export function DesktopSiteNav() {
  const navItems = useSiteNavItems();

  return (
    <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex xl:gap-6">
      {navItems.map((item) =>
        item.type === "link" ? (
          <NavLinkItem key={item.to + item.label} item={item} />
        ) : (
          <NavDropdown key={item.label} item={item} />
        ),
      )}
    </nav>
  );
}

function MobileNavSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: { to: string; label: string }[];
  onNavigate: () => void;
}) {
  const { pathname } = useLocation();

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-muted-foreground">{title}</p>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={cn(
            "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
            pathname === item.to ||
              pathname.startsWith(`${item.to}/`) ||
              (item.to.startsWith("/categories/") &&
                pathname.startsWith(item.to))
              ? "bg-accent text-accent-foreground"
              : "text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function MobileSiteNav({
  authHref,
  authLabel,
}: {
  authHref?: string;
  authLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navItems = useSiteNavItems();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline text-right">القائمة</SheetTitle>
        </SheetHeader>
        <SiteHeaderSearch className="mt-4 lg:hidden" />
        <nav className="mt-6 flex flex-col gap-6">
          {navItems.map((item) =>
            item.type === "link" ? (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={close}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                  isPublicNavLinkActive(item, pathname)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <MobileNavSection
                key={item.label}
                title={item.label}
                items={item.items}
                onNavigate={close}
              />
            ),
          )}
        </nav>
        {authHref && authLabel ? (
          <div className="mt-6 border-t border-border pt-4">
            <Button asChild className="w-full" onClick={close}>
              <Link to={authHref}>{authLabel}</Link>
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
