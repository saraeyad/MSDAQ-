import { BRAND_LOGO_ICON } from "@/components/brand-logo";
import BrandMeem from "@/components/brand-meem";
import BrandSectionHeader from "@/components/brand-section-header";
import { Search, FileSearch, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

const IDENTITY_PILLARS = [
  { key: "investigate", icon: Search },
  { key: "verify", icon: FileSearch },
  { key: "publish", icon: Eye },
] as const;

export default function HomeIdentity() {
  const { t } = useTranslation();

  return (
    <section className="brand-identity-section relative overflow-hidden border-b border-border py-16 md:py-24">
      <BrandMeem className="absolute -end-8 top-8 text-[12rem] md:text-[18rem]" />

      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <div className="brand-identity-visual relative mx-auto max-w-sm rounded border border-border bg-card p-8 md:mx-0">
              <img
                src={BRAND_LOGO_ICON}
                alt=""
                aria-hidden
                className="mx-auto size-32 object-contain opacity-90 md:size-40"
              />
              <div className="mt-6 space-y-2 border-t border-border pt-6 text-center">
                <p className="font-headline text-3xl font-bold text-foreground">مصداق</p>
                <p className="text-label-caps text-muted-foreground">MISDAQ</p>
              </div>
              <p className="mt-4 text-center text-sm italic text-muted-foreground">
                {t("home.identity.motto")}
              </p>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-7">
            <BrandSectionHeader
              label={t("home.identity.label")}
              title={t("home.identity.title")}
              description={t("home.identity.description")}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              {IDENTITY_PILLARS.map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="rounded border border-border bg-background p-4 transition-colors hover:border-secondary"
                >
                  <Icon className="size-5 text-secondary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {t(`home.identity.steps.${key}.title`)}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t(`home.identity.steps.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-6 border-t border-border pt-6">
              {(["articles", "journalists", "claims"] as const).map((stat) => (
                <div key={stat}>
                  <p className="font-headline text-2xl font-bold text-secondary">
                    {t(`home.identity.stats.${stat}.value`)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`home.identity.stats.${stat}.label`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
