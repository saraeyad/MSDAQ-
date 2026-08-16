import { SiteHeaderSearch } from "@/components/site-header-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  type PublicNavMenuLink,
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

function pathMatches(to: string, pathname: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavDropdown({ item }: { item: PublicNavDropdownItem }) {
  const { pathname } = useLocation();
  const active = isDropdownActive(item.paths, pathname);
  const [open, setOpen] = useState(false);
  const [expandedTo, setExpandedTo] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const syncExpandedFromPath = () => {
    const current = item.items.find((entry) =>
      entry.children?.some((child) => pathMatches(child.to, pathname)),
    );
    setExpandedTo(current?.to ?? null);
  };

  const handleEnter = () => {
    clearCloseTimer();
    if (!open) syncExpandedFromPath();
    setOpen(true);
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearCloseTimer(), []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setExpandedTo(null);
      return;
    }
    const current = item.items.find(
      (entry) =>
        entry.children?.some((child) => pathMatches(child.to, pathname)),
    );
    setExpandedTo(current?.to ?? null);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
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
        {item.items.map((entry) => {
          const hasChildren = Boolean(entry.children?.length);
          const isExpanded = expandedTo === entry.to;

          return (
            <DropdownMenuGroup key={entry.to}>
              {hasChildren ? (
                <DropdownMenuItem
                  className={cn(
                    "site-nav-parent",
                    pathMatches(entry.to, pathname) && "text-primary font-medium",
                  )}
                  onSelect={(event) => {
                    event.preventDefault();
                    setExpandedTo(isExpanded ? null : entry.to);
                  }}
                >
                  <span>{entry.label}</span>
                  <ChevronDown
                    className={cn(
                      "site-nav-parent__chevron",
                      isExpanded && "site-nav-parent__chevron--open",
                    )}
                    aria-hidden
                  />
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link
                    to={entry.to}
                    className={cn(
                      pathname === entry.to && "text-primary font-medium",
                    )}
                  >
                    {entry.label}
                  </Link>
                </DropdownMenuItem>
              )}
              {hasChildren && isExpanded
                ? entry.children!.map((child) => (
                    <DropdownMenuItem key={child.to} asChild>
                      <Link
                        to={child.to}
                        className={cn(
                          "site-nav-submenu",
                          pathname === child.to && "site-nav-submenu--active",
                        )}
                      >
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))
                : null}
            </DropdownMenuGroup>
          );
        })}
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
  items: PublicNavMenuLink[];
  onNavigate: () => void;
}) {
  const { pathname } = useLocation();
  const [expandedTo, setExpandedTo] = useState<string | null>(() => {
    const current = items.find((item) =>
      item.children?.some((child) => pathMatches(child.to, pathname)),
    );
    return current?.to ?? null;
  });

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-muted-foreground">{title}</p>
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = expandedTo === item.to;

        return (
          <div key={item.to}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpandedTo(isExpanded ? null : item.to)}
                className={cn(
                  "site-nav-parent flex w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                  pathMatches(item.to, pathname)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                )}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "site-nav-parent__chevron",
                    isExpanded && "site-nav-parent__chevron--open",
                  )}
                  aria-hidden
                />
              </button>
            ) : (
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                  pathMatches(item.to, pathname)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                )}
              >
                {item.label}
              </Link>
            )}
            {hasChildren && isExpanded
              ? item.children!.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    onClick={onNavigate}
                    className={cn(
                      "site-nav-submenu block rounded-lg py-2.5 text-sm transition-colors hover:bg-muted",
                      pathMatches(child.to, pathname)
                        ? "site-nav-submenu--active bg-accent"
                        : undefined,
                    )}
                  >
                    {child.label}
                  </Link>
                ))
              : null}
          </div>
        );
      })}
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
