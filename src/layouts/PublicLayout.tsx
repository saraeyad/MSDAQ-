import { BrandLogo } from "@/components/brand-logo";
import { NavGhazawiyaLink } from "@/components/nav-ghazawiya-link";
import { SiteHeaderSearch } from "@/components/site-header-search";
import { DesktopSiteNav, MobileSiteNav } from "@/components/site-header-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { ROUTES } from "@/router/routes";
import { LogIn } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  const { token } = useAuth();
  const authHref = token ? ROUTES.NEWSROOM : ROUTES.LOGIN;
  const authLabel = token ? "مساحة العمل" : "تسجيل الدخول";

  return (
    <div className="min-h-screen page-gradient">
      <header className="site-header ghazawiya-pattern">
        <div className="site-header__inner container-page flex min-h-[4.5rem] items-center gap-3 py-3 md:gap-4">
          <div className="flex shrink-0 items-center gap-3 md:gap-4">
            <BrandLogo size="lg" />
            <NavGhazawiyaLink />
          </div>
          <DesktopSiteNav />
          <div className="ms-auto flex shrink-0 items-center gap-2">
            <SiteHeaderSearch className="hidden w-40 lg:block lg:w-44 xl:w-52" />
            <Button asChild size="sm" className="hidden gap-2 lg:inline-flex">
              <Link to={authHref}>
                {!token ? <LogIn className="size-4" /> : null}
                {authLabel}
              </Link>
            </Button>
            <MobileSiteNav authHref={authHref} authLabel={authLabel} />
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
