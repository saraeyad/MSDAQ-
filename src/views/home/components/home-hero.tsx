import BrandLogo from "@/components/brand-logo";
import ScoreRing from "@/components/score-ring";
import BrandMeem from "@/components/brand-meem";
import BrandWatermark from "@/components/brand-watermark";
import HomeHeroArcSearch from "./home-hero-arc-search";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { ROUTES } from "@/router/routes";
import { ArrowLeft, ArrowRight, PenLine, Search } from "lucide-react";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function HomeHero() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const isRtl = i18n.dir() === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const isJournalist = user?.role === "journalist";

  return (
    <section className="home-hero relative overflow-hidden border-b border-border">
      <HomeHeroArcSearch />
      <BrandWatermark
        size="xl"
        className="absolute -bottom-8 end-0 z-[1] translate-x-1/4 md:end-16"
      />
      <BrandMeem className="absolute -start-4 top-1/2 z-[1] -translate-y-1/2 text-[10rem] md:text-[14rem]" />
      <div className="container-page relative z-[2] py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <p className="text-label-caps text-secondary">
              {t("home.tagline")}
            </p>

            <BrandLogo linkToHome={false} size="xl" />

            <div className="home-editorial-rule" />

            <h1 className="max-w-2xl text-display-lg">{t("home.heroTitle")}</h1>
            <p className="max-w-xl text-body-lg text-muted-foreground">
              {t("home.heroDescription")}
            </p>

            <blockquote className="brand-mission-quote max-w-xl border-s-4 border-secondary ps-4">
              <p className="font-headline text-lg italic text-foreground/90">
                {t("home.missionQuote")}
              </p>
            </blockquote>

            <div className="flex flex-wrap gap-3 pt-2">
              {/* Primary CTA — always tool-first */}
              <Button size="lg" asChild>
                <Link to={ROUTES.CREDIBILITY}>
                  <Search className="size-4" />
                  {t("home.tryCredibility")}
                </Link>
              </Button>

              {/* Secondary CTA — Smart Editor (demo for guests, real editor for journalists) */}
              {isJournalist ? (
                <Button size="lg" variant="outline" asChild>
                  <Link to={ROUTES.JOURNALIST_EDITOR}>
                    <PenLine className="size-4" />
                    {t("home.tools.editor.ctaJournalist")}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild>
                  <Link to={ROUTES.SMART_EDITOR_DEMO}>
                    <PenLine className="size-4" />
                    {t("home.seeSmartEditor")}
                  </Link>
                </Button>
              )}

              {/* Tertiary — register/apply for non-authenticated users */}
              {!token ? (
                <Button size="lg" variant="ghost" asChild>
                  <Link to={ROUTES.REGISTER}>
                    {t("home.getStarted")}
                    <ArrowIcon className="size-4" />
                  </Link>
                </Button>
              ) : user?.role === "normal_user" ? (
                <Button size="lg" variant="ghost" asChild>
                  <Link to={ROUTES.JOURNALIST_APPLY}>
                    {t("home.applyJournalist")}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="home-trust-panel-wrap relative mx-auto max-w-sm md:ms-auto">
              <div className="investigation-dossier home-trust-panel relative">
                <div className="investigation-dossier-header flex items-center justify-between border-b border-border px-6 py-3">
                  <p className="text-label-caps text-muted-foreground">
                    {t("home.trustPanel.label")}
                  </p>
                  <span className="font-mono text-xs text-muted-foreground/70">
                    {t("home.trustPanel.caseId")}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex justify-center">
                    <ScoreRing
                      score={94}
                      size="lg"
                      label={t("home.trustPanel.score")}
                      animated
                    />
                  </div>

                  <div className="mt-6 space-y-3 border-t border-border pt-6">
                    <div className="flex items-center justify-between text-body-md">
                      <span className="text-muted-foreground">
                        {t("home.trustPanel.sources")}
                      </span>
                      <span className="font-semibold text-trust-high">98%</span>
                    </div>
                    <div className="flex items-center justify-between text-body-md">
                      <span className="text-muted-foreground">
                        {t("home.trustPanel.neutrality")}
                      </span>
                      <span className="font-semibold text-secondary">85%</span>
                    </div>
                    <div className="flex items-center justify-between text-body-md">
                      <span className="text-muted-foreground">
                        {t("home.trustPanel.verification")}
                      </span>
                      <span className="font-semibold text-secondary">92%</span>
                    </div>
                  </div>

                  <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                    {t("home.trustPanel.caption")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
