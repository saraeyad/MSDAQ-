import BrandLogo from "@/components/brand-logo";

import JournalistRequestButton from "@/components/journalist-request-button";

import LanguageSwitcher from "@/components/language-switcher";

import {

  ServicesNavDropdownDesktop,

  ServicesNavDropdownMobile,

} from "@/components/services-nav-dropdown";

import UserAccountMenu from "@/components/user-account-menu";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/auth";

import { getJournalistRequestHref } from "@/lib/auth-redirect";

import { cn } from "@/lib/utils";

import { ROUTES } from "@/router/routes";

import { Auth_APIs } from "@/services/api/auth";

import { Menu, X } from "lucide-react";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";



const CONTENT_ITEMS = [

  { key: "MENU.ARTICLES", path: ROUTES.ARTICLES },

  { key: "MENU.DISCUSSION", path: ROUTES.DISCUSSION },

] as const;



const TOOL_ITEMS = [

  { key: "MENU.CREDIBILITY", path: ROUTES.CREDIBILITY },

  { key: "MENU.SMART_EDITOR", path: ROUTES.SMART_EDITOR_DEMO },

  { key: "MENU.IMAGE_VERIFICATION", path: ROUTES.IMAGE_VERIFICATION },

] as const;



export default function PublicLayout() {

  const { t } = useTranslation();

  const { token, user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [loggingOut, setLoggingOut] = useState(false);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);



  const journalistRequestHref = getJournalistRequestHref(Boolean(token), user?.role);



  const handleLogout = async () => {

    if (loggingOut) return;

    setLoggingOut(true);

    try {

      await Auth_APIs.logout();

      logout();

      navigate(ROUTES.HOME);

    } finally {

      setLoggingOut(false);

    }

  };



  return (

    <div className="misdaq-showcase-surface min-h-screen">

      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md">

        <div className="brand-header-accent" />

        <div className="container-page flex items-center justify-between py-4">

          <BrandLogo />



          <nav className="hidden items-center gap-1 md:flex">

            <ServicesNavDropdownDesktop />

            <span className="mx-2 h-4 w-px bg-border" aria-hidden />

            {CONTENT_ITEMS.map((item) => (

              <Link

                key={item.path}

                to={item.path}

                className={cn(

                  "nav-link px-3 py-1.5",

                  location.pathname === item.path && "nav-link-active"

                )}

              >

                {t(item.key)}

              </Link>

            ))}

          </nav>



          <div className="flex items-center gap-2 sm:gap-3">

            <Button

              variant="ghost"

              size="icon"

              className="md:hidden"

              onClick={() => setMobileNavOpen((prev) => !prev)}

              aria-label="Toggle navigation"

            >

              {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}

            </Button>



            {journalistRequestHref ? (

              <JournalistRequestButton

                href={journalistRequestHref}

                className="hidden sm:inline-flex"

              />

            ) : null}



            {token ? (

              <UserAccountMenu onLogout={handleLogout} loggingOut={loggingOut} />

            ) : (

              <div className="flex items-center gap-2">

                <Button variant="outline" size="sm" asChild>

                  <Link to={ROUTES.LOGIN}>{t("auth.login")}</Link>

                </Button>

                <Button size="sm" asChild>

                  <Link to={ROUTES.REGISTER}>{t("auth.register")}</Link>

                </Button>

              </div>

            )}

            <LanguageSwitcher />

          </div>

        </div>



        {mobileNavOpen ? (

          <nav className="border-t border-border px-4 py-4 md:hidden">

            <div className="flex flex-col gap-1">

              <ServicesNavDropdownMobile onNavigate={() => setMobileNavOpen(false)} />

              <div className="my-2 border-t border-border" />

              {CONTENT_ITEMS.map((item) => (

                <Link

                  key={item.path}

                  to={item.path}

                  onClick={() => setMobileNavOpen(false)}

                  className={cn(

                    "nav-link px-3 py-2 text-base",

                    location.pathname === item.path && "nav-link-active"

                  )}

                >

                  {t(item.key)}

                </Link>

              ))}

              {journalistRequestHref ? (

                <JournalistRequestButton

                  href={journalistRequestHref}

                  onClick={() => setMobileNavOpen(false)}

                />

              ) : null}

            </div>

          </nav>

        ) : null}

      </header>



      <main>

        <Outlet />

      </main>



      <footer className="brand-footer mt-20 border-t border-border">

        <div className="container-page py-14">

          <div className="grid gap-10 md:grid-cols-12">

            <div className="space-y-4 md:col-span-5">

              <BrandLogo linkToHome={false} variant="icon" size="lg" />

              <p className="font-headline text-xl font-semibold text-foreground">

                {t("brand.name")}

              </p>

              <p className="max-w-sm text-body-md text-muted-foreground">{t("brand.mission")}</p>

              <p className="font-headline text-sm italic text-muted-foreground/80">

                {t("brand.motto")}

              </p>

            </div>



            <div className="md:col-span-3">

              <p className="text-label-caps text-secondary">{t("home.tools.label")}</p>

              <ul className="mt-4 space-y-2">

                {TOOL_ITEMS.map((item) => (

                  <li key={item.path}>

                    <Link

                      to={item.path}

                      className="text-body-md text-muted-foreground transition-colors hover:text-secondary"

                    >

                      {t(item.key)}

                    </Link>

                  </li>

                ))}

              </ul>

              <p className="mt-5 text-label-caps text-secondary">{t("brand.explore")}</p>

              <ul className="mt-4 space-y-2">

                <li>

                  <Link

                    to={ROUTES.HOME}

                    className="text-body-md text-muted-foreground transition-colors hover:text-secondary"

                  >

                    {t("MENU.HOME")}

                  </Link>

                </li>

                {CONTENT_ITEMS.map((item) => (

                  <li key={item.path}>

                    <Link

                      to={item.path}

                      className="text-body-md text-muted-foreground transition-colors hover:text-secondary"

                    >

                      {t(item.key)}

                    </Link>

                  </li>

                ))}

              </ul>

            </div>



            <div className="md:col-span-4">

              <p className="text-label-caps text-secondary">{t("brand.identity.label")}</p>

              <ul className="mt-4 space-y-3">

                {(["investigate", "verify", "publish"] as const).map((key) => (

                  <li key={key} className="text-body-md text-muted-foreground">

                    <span className="font-medium text-foreground">

                      {t(`brand.identity.${key}.title`)}

                    </span>

                    {" — "}

                    {t(`brand.identity.${key}.description`)}

                  </li>

                ))}

              </ul>

            </div>

          </div>



          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-center sm:flex-row sm:text-start">

            <p className="text-label-caps text-muted-foreground/70">

              © {new Date().getFullYear()} MISDAQ — {t("brand.name")}

            </p>

            <p className="text-xs text-muted-foreground/60">{t("brand.tagline")}</p>

          </div>

        </div>

      </footer>

    </div>

  );

}


