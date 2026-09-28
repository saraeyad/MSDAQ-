import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { ThemeSwitcher } from "@/components/site/theme-switcher";
import { SiteBrandLink } from "@/features/public-site/components/site-brand-link";
import { SiteHeaderSearch } from "@/components/site/site-header-search";
import { DesktopSiteNav, MobileSiteNav } from "@/components/site/site-header-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PlatformFeedbackProvider } from "@/context/platform-feedback";
import { PlatformFeedbackFab } from "@/features/public-site/platform-feedback/PlatformFeedbackFab";
import { useAuth } from "@/context/auth";
import { usePublicCopy } from "@/context/locale";
import {
  isPublicArticlePath,
  resetArticleViewDedupe,
  trackPageView,
} from "@/lib/site";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { cn } from "@/lib/utils";
import { lazy, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

const HomeToolsSection = lazy(() =>
  import("@/features/public-site/home/HomeToolsSection").then((module) => ({
    default: module.HomeToolsSection,
  })),
);
const PartnersStrip = lazy(() =>
  import("@/features/public-site/partners/PartnersStrip").then((module) => ({
    default: module.PartnersStrip,
  })),
);
const PilotLaunchWelcome = lazy(() =>
  import("@/features/public-site/welcome/PilotLaunchWelcome").then((module) => ({
    default: module.PilotLaunchWelcome,
  })),
);

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


  return (
    <PlatformFeedbackProvider>
      <div
        className={cn(
          "flex min-h-screen flex-col page-gradient",
          isHome && "public-home",
        )}
      >
        <header className="site-header site-header--paper">
          <div className="site-header__utility">
            <div className="site-header__utility-inner container-page">
              <LocaleSwitcher className="site-header__utility-locale" />
              <span className="site-header__utility-sep" aria-hidden />
              <ThemeSwitcher className="site-header__utility-theme" />
            </div>
          </div>
          <div className="site-header__inner container-page flex min-h-12 items-center gap-2 py-1 sm:min-h-16 sm:gap-3 md:gap-5">
            <div className="site-header__brand">
              <SiteBrandLink linkToHome />
            </div>
            <DesktopSiteNav />
            <div className="ms-auto flex shrink-0 items-center gap-2">
              <SiteHeaderSearch className="hidden w-40 lg:block lg:w-44 xl:w-52" />
              {/* {authHref && authLabel ? (
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
              ) : null} */}
              <MobileSiteNav authHref={authHref} authLabel={authLabel} />
              <a
                href="https://cdmcgaza.ps/ar/"
                className="site-header__cdmc"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/brand/cdmc.webp?v=3"
                  alt="CDMC"
                  width={120}
                  height={120}
                  decoding="async"
                />
              </a>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        {showHomeSections ? (
          <Suspense fallback={null}>
            <HomeToolsSection />
            <PartnersStrip />
          </Suspense>
        ) : null}
        <SiteFooter className="mt-auto" />
        <PlatformFeedbackFab />
        <Suspense fallback={null}>
          <PilotLaunchWelcome />
        </Suspense>
      </div>
    </PlatformFeedbackProvider>
  );
}
