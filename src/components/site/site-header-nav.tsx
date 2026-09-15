import { SiteHeaderSearch } from "@/components/site/site-header-search";
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
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { useLocale, usePublicCopy } from "@/context/locale";
import {
  buildPublicNavItems,
  isPublicNavLinkActive,
  type PublicNavDropdownItem,
  type PublicNavItem,
  type PublicNavLinkItem,
  type PublicNavMenuLink,
} from "@/features/public-site/categories/public-nav";
import { usePublicCategories } from "@/hooks/public";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Menu } from "lucide-react";

function isDropdownActive(paths: string[], pathname: string) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function pathMatches(to: string, pathname: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavParentFlyoutRow({
  entry,
  pathname,
}: {
  entry: PublicNavMenuLink;
  pathname: string;
}) {
  const { dir } = useLocale();
  const { nav } = usePublicCopy();
  const FlyoutChevron = dir === "rtl" ? ChevronLeft : ChevronRight;
  const hasChildren = Boolean(entry.children?.length);
  const parentActive = pathMatches(entry.to, pathname);
  const branchActive = entry.children?.some((child) =>
    pathMatches(child.to, pathname),
  );

  if (!hasChildren) {
    return (
      <DropdownMenuItem asChild>
        <Link
          to={entry.to}
          className={cn(parentActive && "text-primary font-medium")}
        >
          {entry.label}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <div className="site-nav-parent-row">
      <Link
        to={entry.to}
        className={cn(
          "site-nav-parent-link site-nav-parent-link--has-children",
          (parentActive || branchActive) && "site-nav-parent-link--active",
        )}
      >
        <span className="site-nav-parent-link__label">{entry.label}</span>
        <FlyoutChevron
          className="site-nav-parent-link__chevron"
          aria-hidden
        />
      </Link>
      <div
        className="site-nav-flyout"
        role="menu"
        aria-label={`${entry.label} — ${nav.subcategories}`}
      >
        <p className="site-nav-flyout__heading">{entry.label}</p>
        <ul className="site-nav-flyout__list">
          {entry.children!.map((child) => {
            const active = pathMatches(child.to, pathname);
            return (
              <li key={child.to}>
                <Link
                  to={child.to}
                  role="menuitem"
                  className={cn(
                    "site-nav-flyout__link",
                    active && "site-nav-flyout__link--active",
                  )}
                >
                  <span className="site-nav-flyout__bullet" aria-hidden />
                  <span className="site-nav-flyout__label">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
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
        className="site-nav-dropdown min-w-44 overflow-visible"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {item.items.map((entry) => (
          <NavParentFlyoutRow key={entry.to} entry={entry} pathname={pathname} />
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
  const { locale } = useLocale();
  const { nav } = usePublicCopy();

  return useMemo(
    () => buildPublicNavItems(categories, nav, locale),
    [categories, nav, locale],
  );
}

export function DesktopSiteNav() {
  const navItems = useSiteNavItems();

  return (
    <nav className="site-header-nav hidden flex-1 items-center justify-center lg:flex">
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
  const [expandedTo, setExpandedTo] = useState<string | null>(null);

  return (
    <div className="site-mobile-nav__section">
      <p className="site-mobile-nav__label">{title}</p>
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = expandedTo === item.to;

        return (
          <div key={item.to} className="site-mobile-nav__group">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpandedTo(isExpanded ? null : item.to)}
                aria-expanded={isExpanded}
                className={cn(
                  "site-mobile-nav__link site-mobile-nav__link--parent",
                  (pathMatches(item.to, pathname) ||
                    item.children?.some((child) =>
                      pathMatches(child.to, pathname),
                    )) &&
                    "site-mobile-nav__link--active",
                )}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "site-mobile-nav__chevron",
                    isExpanded && "site-mobile-nav__chevron--open",
                  )}
                  aria-hidden
                />
              </button>
            ) : (
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "site-mobile-nav__link",
                  pathMatches(item.to, pathname) &&
                    "site-mobile-nav__link--active",
                )}
              >
                {item.label}
              </Link>
            )}
            {hasChildren ? (
              <div
                className={cn(
                  "site-mobile-nav__children",
                  isExpanded && "site-mobile-nav__children--open",
                )}
                aria-hidden={!isExpanded}
              >
                <div className="site-mobile-nav__children-inner">
                  {item.children!.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to}
                      onClick={onNavigate}
                      tabIndex={isExpanded ? 0 : -1}
                      className={cn(
                        "site-mobile-nav__sublink",
                        pathMatches(child.to, pathname) &&
                          "site-mobile-nav__sublink--active",
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
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
  const { dir } = useLocale();
  const { nav } = usePublicCopy();
  const navItems = useSiteNavItems();
  const close = () => setOpen(false);
  const sheetSide = dir === "rtl" ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="site-mobile-nav-trigger shrink-0 lg:hidden"
          aria-label={nav.openMenu}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={sheetSide}
        className={cn(
          "site-mobile-nav gap-0 p-0 w-[min(100%,20.5rem)]",
          sheetSide === "right"
            ? "site-mobile-nav--right"
            : "site-mobile-nav--left",
        )}
      >
        <SheetHeader className="site-mobile-nav__header ghazawiya-pattern">
          <SheetTitle className="site-mobile-nav__title">
            {nav.menu}
          </SheetTitle>
        </SheetHeader>
        <div className="site-mobile-nav__tools">
          <SiteHeaderSearch className="site-mobile-nav__search flex-1" />
          <LocaleSwitcher className="site-mobile-nav__locale" />
        </div>
        <nav className="site-mobile-nav__list">
          {navItems.map((item) =>
            item.type === "link" ? (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={close}
                className={cn(
                  "site-mobile-nav__link",
                  isPublicNavLinkActive(item, pathname) &&
                    "site-mobile-nav__link--active",
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
          <div className="site-mobile-nav__footer">
            <Button asChild className="site-mobile-nav__auth" onClick={close}>
              <Link to={authHref}>{authLabel}</Link>
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
