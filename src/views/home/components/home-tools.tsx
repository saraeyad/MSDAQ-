import ScoreRing from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { ROUTES } from "@/router/routes";
import { CheckCircle2, PenLine, ScanSearch, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function HomeTools() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isJournalist = user?.role === "journalist";

  const editorFeatures = [
    t("home.tools.editor.feature1"),
    t("home.tools.editor.feature2"),
    t("home.tools.editor.feature3"),
    t("home.tools.editor.feature4"),
  ];

  return (
    <section className="border-t border-border bg-card py-16 md:py-20">
      <div className="container-page">
        <div className="mb-10">
          <p className="text-label-caps text-secondary">{t("home.tools.label")}</p>
          <h2 className="mt-2 text-headline-md">{t("home.tools.title")}</h2>
          <p className="mt-2 max-w-xl text-body-md text-muted-foreground">
            {t("home.tools.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Credibility Checker */}
          <div className="group flex flex-col justify-between rounded border border-border bg-background p-8 transition-colors hover:border-secondary">
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded border border-border bg-muted">
                  <Search className="size-6 text-secondary" />
                </div>
                <Badge variant="secondary">{t("home.tools.credibility.badge")}</Badge>
              </div>

              <h3 className="text-headline-sm">{t("home.tools.credibility.title")}</h3>
              <p className="mt-3 text-body-md text-muted-foreground">
                {t("home.tools.credibility.description")}
              </p>

              <div className="mt-6 rounded border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                  <ScoreRing score={94} size="md" label={t("home.trustPanel.score")} animated />
                  <div className="grid flex-1 grid-cols-3 gap-2">
                    {[
                      { label: t("home.trustPanel.sources"), score: 98 },
                      { label: t("home.trustPanel.neutrality"), score: 85 },
                      { label: t("home.trustPanel.verification"), score: 92 },
                    ].map(({ label, score }) => (
                      <div key={label} className="flex flex-col items-center gap-1 text-center">
                        <ScoreRing score={score} size="sm" animated />
                        <span className="text-[10px] leading-tight text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button className="mt-8 w-full" size="lg" asChild>
              <Link to={ROUTES.CREDIBILITY}>
                <Search className="size-4" />
                {t("home.tools.credibility.cta")}
              </Link>
            </Button>
          </div>

          {/* Image Trace */}
          <div className="group flex flex-col justify-between rounded border border-border bg-background p-8 transition-colors hover:border-accent-investigation">
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded border border-border bg-accent-investigation-muted">
                  <ScanSearch className="size-6 text-accent-investigation" />
                </div>
                <Badge variant="secondary">{t("home.tools.imageTrace.badge")}</Badge>
              </div>

              <h3 className="text-headline-sm">{t("home.tools.imageTrace.title")}</h3>
              <p className="mt-3 text-body-md text-muted-foreground">
                {t("home.tools.imageTrace.description")}
              </p>

              <div className="relative mt-6 flex h-28 items-center justify-center rounded border border-border bg-accent-investigation-muted/50 p-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="absolute size-16 rounded border-2 border-white bg-muted shadow-md"
                    style={{
                      transform: `rotate(${(index - 1) * 8}deg) translateX(${(index - 1) * 24}px)`,
                      zIndex: index,
                    }}
                  />
                ))}
              </div>
            </div>

            <Button className="mt-8 w-full" size="lg" variant="outline" asChild>
              <Link to={ROUTES.IMAGE_VERIFICATION}>
                <ScanSearch className="size-4" />
                {t("home.tools.imageTrace.cta")}
              </Link>
            </Button>
          </div>

          {/* Smart Editor */}
          <div className="group flex flex-col justify-between rounded border border-border bg-background p-8 transition-colors hover:border-accent-editor">
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded border border-border bg-accent-editor/10">
                  <PenLine className="size-6 text-accent-editor" />
                </div>
                <Badge variant="outline">{t("home.tools.editor.badge")}</Badge>
              </div>

              <h3 className="text-headline-sm">{t("home.tools.editor.title")}</h3>
              <p className="mt-3 text-body-md text-muted-foreground">
                {t("home.tools.editor.description")}
              </p>

              <ul className="mt-6 space-y-2">
                {editorFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-accent-editor" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button className="mt-8 w-full" size="lg" variant="outline" asChild>
              <Link to={isJournalist ? ROUTES.JOURNALIST_EDITOR : ROUTES.SMART_EDITOR_DEMO}>
                <PenLine className="size-4" />
                {isJournalist
                  ? t("home.tools.editor.ctaJournalist")
                  : t("home.tools.editor.cta")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <span className="text-label-caps">{t("home.tools.explore")}</span>
          <Link to={ROUTES.ARTICLES} className="hover:text-secondary">
            {t("home.tools.articles")}
          </Link>
          <Link to={ROUTES.DISCUSSION} className="hover:text-secondary">
            {t("home.tools.discussion")}
          </Link>
        </div>
      </div>
    </section>
  );
}
