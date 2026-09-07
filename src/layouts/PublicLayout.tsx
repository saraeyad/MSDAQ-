import { SiteBrandLink } from "@/features/public-site/components/site-brand-link";
import { SiteHeaderSearch } from "@/components/site-header-search";
import { DesktopSiteNav, MobileSiteNav } from "@/components/site-header-nav";
import { SiteFooter } from "@/components/site-footer";
import { PartnersStrip } from "@/features/public-site/partners/PartnersStrip";
import { PlatformFeedbackProvider } from "@/context/platform-feedback";
import { PlatformFeedbackFab } from "@/features/public-site/platform-feedback/PlatformFeedbackFab";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { LogIn } from "lucide-react";
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
    pathname === ROUTES.DATA_INFO
  ) {
    return false;
  }
  return true;
}

export default function PublicLayout() {
  const location = useLocation();
  const showHomeSections = shouldShowHomeSections(location.pathname);
  const { token, hasAnyPermission } = useAuth();
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
      ? "مساحة العمل"
      : undefined
    : "تسجيل الدخول";

  return (
    <PlatformFeedbackProvider>
      <div className="min-h-screen page-gradient">
        <header className="site-header ghazawiya-pattern">
          <div className="site-header__inner container-page flex min-h-[4.5rem] items-center gap-3 py-3 md:gap-4">
            <div className="flex shrink-0 items-center">
              <SiteBrandLink linkToHome />
            </div>
            <DesktopSiteNav />
            <div className="ms-auto flex shrink-0 items-center gap-2">
              <SiteHeaderSearch className="hidden w-40 lg:block lg:w-44 xl:w-52" />
              {authHref && authLabel ? (
                <Button asChild size="sm" className="hidden gap-2 lg:inline-flex">
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

        <main>
          <Outlet />
        </main>
        {showHomeSections ? <HomeToolsSection /> : null}
        {showHomeSections ? <PartnersStrip /> : null}
        <SiteFooter className={showHomeSections ? undefined : "mt-0"} />
        <PlatformFeedbackFab />
        <PilotLaunchWelcome />
      </div>
    </PlatformFeedbackProvider>
  );
}
