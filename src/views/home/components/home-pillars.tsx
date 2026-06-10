import BrandSectionHeader from "@/components/brand-section-header";
import { cn } from "@/lib/utils";
import { BookOpen, Scale, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const PILLARS = [
  { key: "standards", icon: Scale },
  { key: "trust", icon: Search },
  { key: "transparency", icon: BookOpen },
] as const;

export default function HomePillars() {
  const { t } = useTranslation();

  return (
    <section className="home-section-gap border-b border-border/80">
      <div className="container-page">
        <BrandSectionHeader
          className="articles-animate-in mb-8 md:mb-10"
          label={t("home.pillars.label")}
          title={t("home.pillars.title")}
          description={t("home.pillars.subtitle")}
        />

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {PILLARS.map(({ key, icon: Icon }, index) => (
            <div
              key={key}
              className={cn(
                "home-pillar-card brand-pillar-card rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-secondary",
                "articles-animate-in",
              )}
              style={{ animationDelay: `${index * 80 + 100}ms` }}
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-secondary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-headline-sm">{t(`home.pillars.${key}.title`)}</h3>
              <p className="mt-3 text-body-md text-muted-foreground">
                {t(`home.pillars.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
