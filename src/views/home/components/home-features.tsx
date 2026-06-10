import BrandSectionHeader from "@/components/brand-section-header";
import { ROUTES } from "@/router/routes";
import { ArrowUpRight, MessageSquare, Newspaper, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const FEATURES = [
  { key: "articles", icon: Newspaper, path: ROUTES.ARTICLES },
  { key: "discussion", icon: MessageSquare, path: ROUTES.DISCUSSION },
  { key: "credibility", icon: Search, path: ROUTES.CREDIBILITY },
] as const;

export default function HomeFeatures() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-20">
      <div className="container-page">
        <BrandSectionHeader
          className="mb-10"
          label={t("home.features.label")}
          title={t("home.features.title")}
          description={t("home.features.subtitle")}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon, path }) => (
            <Link
              key={key}
              to={path}
              className="group flex flex-col justify-between rounded border border-border bg-card p-6 transition-colors hover:border-secondary"
            >
              <div>
                <Icon className="size-6 text-secondary" />
                <h3 className="mt-4 text-headline-sm">{t(`home.features.${key}.title`)}</h3>
                <p className="mt-2 text-body-md text-muted-foreground">
                  {t(`home.features.${key}.description`)}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-secondary">
                {t("home.features.explore")}
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
