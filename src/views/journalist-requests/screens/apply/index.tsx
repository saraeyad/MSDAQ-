import BrandLogo from "@/components/brand-logo";
import LanguageSwitcher from "@/components/language-switcher";
import { infoToast } from "@/components/sonner-toast";
import UserAccountMenu from "@/components/user-account-menu";
import { useAuth } from "@/context/auth";
import { useJournalistRequestPending } from "@/hooks/useJournalistRequestPending";
import { isJournalistRequestPending } from "@/lib/journalist-request-status";
import { ROUTES } from "@/router/routes";
import { Auth_APIs } from "@/services/api/auth";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import JournalistApplySidebar from "../../components/journalist-apply-sidebar";
import JournalistRequestForm from "../../components/journalist-request-form";
import JournalistRequestPending from "../../components/journalist-request-pending";

export default function JournalistApply() {
  const { t } = useTranslation();
  const { token, logout, user } = useAuth();
  const { isPending } = useJournalistRequestPending();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const pendingToastShown = useRef(false);

  useEffect(() => {
    if (pendingToastShown.current || !user?.id) return;
    if (!isJournalistRequestPending(user.id)) return;
    pendingToastShown.current = true;
    infoToast(t("journalistRequest.underReview"));
    // Show once when opening the apply page with an existing pending request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="journalist-apply-page min-h-screen bg-background">
      <header className="journalist-apply-topbar">
        <div className="brand-header-accent" />
        <div className="container-page flex items-center justify-between py-4">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {token ? (
              <UserAccountMenu onLogout={handleLogout} loggingOut={loggingOut} />
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-secondary hover:underline"
              >
                {t("auth.login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container-page py-6 md:py-8">
        <div className="journalist-apply-layout">
          <div className="journalist-apply-sidebar-wrap">
            <JournalistApplySidebar />
          </div>
          <div className="journalist-apply-form-wrap">
            {isPending ? <JournalistRequestPending /> : <JournalistRequestForm />}
          </div>
        </div>
      </main>

      <footer className="journalist-apply-footer">
        <div className="container-page py-10">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="space-y-3 md:col-span-5">
              <BrandLogo linkToHome={false} variant="icon" size="md" />
              <p className="font-headline text-xl font-semibold text-foreground">
                {t("brand.name")}
              </p>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {t("journalistRequest.footerDescription")}
              </p>
            </div>

            <div className="md:col-span-7">
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-label-caps text-secondary">
                    {t("journalistRequest.footer.policies")}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>{t("journalistRequest.footer.editorialGuidelines")}</li>
                    <li>{t("journalistRequest.footer.codeOfEthics")}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-label-caps text-secondary">
                    {t("journalistRequest.footer.company")}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>{t("journalistRequest.footer.transparency")}</li>
                    <li>{t("journalistRequest.footer.privacy")}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-label-caps text-secondary">
                    {t("journalistRequest.footer.contact")}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>{t("journalistRequest.footer.contactUs")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} MISDAQ — {t("brand.name")}
          </p>
        </div>
      </footer>
    </div>
  );
}
