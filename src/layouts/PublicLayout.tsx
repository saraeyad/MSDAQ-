import { LocaleSwitcher } from "@/components/locale-switcher";
import { SiteBrandLink } from "@/features/public-site/components/site-brand-link";
import { SiteHeaderSearch } from "@/components/site-header-search";
import { DesktopSiteNav, MobileSiteNav } from "@/components/site-header-nav";
import { SiteFooter } from "@/components/site-footer";
import { PartnersStrip } from "@/features/public-site/partners/PartnersStrip";
import { PlatformFeedbackProvider } from "@/context/platform-feedback";
import { PlatformFeedbackFab } from "@/features/public-site/platform-feedback/PlatformFeedbackFab";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { usePublicCopy } from "@/context/locale";
import {
  isPublicArticlePath,
  resetArticleViewDedupe,
  trackPageView,
} from "@/lib/google-analytics";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { HomeToolsSection } from "@/features/public-site/home/HomeToolsSection";
import { PilotLaunchWelcome } from "@/features/public-site/welcome/PilotLaunchWelcome";

function shouldShowHomeSections(pathname: string): boolean {
  if (pathname === ROUTES.ARTICLES || /^\/articles\/[^/]+$/.test(pathname)) {
    return false;
  }
  if (/^\/categories\/[^/]+$/.test(pathname)) {
    return false;
  }
  if (/^\/publications(?:\/[^/]+)?$/.test(pathname)) {
    return false;
  }
  if (
    pathname === ROUTES.ABOUT ||
    pathname === ROUTES.PARTNERS ||
    pathname === ROUTES.DATA_INFO ||
    pathname === ROUTES.TOOLS_OVERVIEW
  ) {
    return false;
  }
  return true;
}

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;
  const showHomeSections = shouldShowHomeSections(location.pathname);
  const { token, hasAnyPermission } = useAuth();
  const { nav } = usePublicCopy();
  const [heroScrolled, setHeroScrolled] = useState(false);
  const overlayHeader = isHome && !heroScrolled;

  const canOpenWorkspace = hasAnyPermission([
    PERMISSIONS.VIEW_ARTICLES,
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.ACCESS_TOOLS,
  ]);
  const authHref = token
    ? canOpenWorkspace
      ? ROUTES.NEWSROOM
      : undefined
    : ROUTES.LOGIN;
  const authLabel = token
    ? canOpenWorkspace
      ? nav.workspace
      : undefined
    : nav.login;

  useEffect(() => {
    resetArticleViewDedupe(location.pathname);
    if (isPublicArticlePath(location.pathname)) return;
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isHome) {
      setHeroScrolled(false);
      return;
    }

    const onScroll = () => {
      setHeroScrolled(window.scrollY > 72);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <PlatformFeedbackProvider>
      <div
        className={cn(
          "flex min-h-screen flex-col page-gradient",
          isHome && "public-home",
        )}
      >
        <header
          className={cn(
            "site-header",
            overlayHeader ? "site-header--hero" : "site-header--paper",
            isHome && heroScrolled && "site-header--scrolled",
          )}
        >
          <div className="site-header__inner container-page flex min-h-16 items-center gap-3 py-1.5 md:gap-5">
            <div className="site-header__brand">
              <SiteBrandLink linkToHome />
            </div>
            <DesktopSiteNav />
            <div className="ms-auto flex shrink-0 items-center gap-2">
              <SiteHeaderSearch className="hidden w-40 lg:block lg:w-44 xl:w-52" />
              <LocaleSwitcher className="hidden sm:inline-flex" />
              {authHref && authLabel ? (
                <Button
                  asChild
                  size="sm"
                  className="site-header__auth-btn hidden gap-2 lg:inline-flex"
                >
                  <Link to={authHref}>
                    {!token ? <LogIn className="size-4" /> : null}
                    {authLabel}
                  </Link>
                </Button>
              ) : null}
              <MobileSiteNav authHref={authHref} authLabel={authLabel} />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        {showHomeSections ? <HomeToolsSection /> : null}
        {showHomeSections ? <PartnersStrip /> : null}
        <SiteFooter className="mt-auto" />
        <PlatformFeedbackFab />
        <PilotLaunchWelcome />
      </div>
    </PlatformFeedbackProvider>
  );
}
