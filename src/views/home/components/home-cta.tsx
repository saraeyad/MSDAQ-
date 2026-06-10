import BrandWatermark from "@/components/brand-watermark";
import { infoToast } from "@/components/sonner-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useJournalistRequestPending } from "@/hooks/useJournalistRequestPending";
import { getJournalistRequestHref } from "@/lib/auth-redirect";
import { PenLine } from "lucide-react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function HomeCta() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { isPending } = useJournalistRequestPending();
  const journalistRequestHref = getJournalistRequestHref(Boolean(token), user?.role);

  const handleJournalistClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPending) return;
    event.preventDefault();
    infoToast(t("journalistRequest.underReview"));
  };

  return (
    <section className="home-cta-band relative overflow-hidden border-t border-border">
      <BrandWatermark
        size="xl"
        opacity="medium"
        className="absolute -start-12 top-1/2 -translate-y-1/2"
      />
      <BrandWatermark
        size="lg"
        opacity="medium"
        className="absolute -end-8 bottom-0 opacity-[0.08]"
      />

      <div className="container-page relative home-section-gap">
        <div className="mx-auto max-w-3xl text-center">
          <p className="articles-animate-in text-label-caps text-white/70">
            {t("home.cta.label")}
          </p>
          <h2
            className="articles-animate-in mt-3 text-headline-md text-white"
            style={{ animationDelay: "80ms" }}
          >
            {t("home.cta.title")}
          </h2>
          <p
            className="articles-animate-in mx-auto mt-4 max-w-xl text-body-lg text-white/80"
            style={{ animationDelay: "160ms" }}
          >
            {t("home.cta.description")}
          </p>
          <p
            className="articles-animate-in mx-auto mt-6 max-w-lg font-headline text-lg italic text-white/60"
            style={{ animationDelay: "240ms" }}
          >
            {t("home.cta.motto")}
          </p>
          {journalistRequestHref ? (
            <Button
              size="lg"
              variant="outline"
              className="articles-animate-in mt-8 border-white/30 bg-white text-foreground hover:bg-white/90"
              style={{ animationDelay: "320ms" }}
              asChild
            >
              <Link to={journalistRequestHref} onClick={handleJournalistClick}>
                <PenLine className="size-4" />
                {t("MENU.REQUEST_JOURNALIST")}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
