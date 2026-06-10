import BrandLogo from "@/components/brand-logo";
import { FileCheck, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const SIDEBAR_FEATURES = [
  { key: "standards", icon: ShieldCheck },
  { key: "ethics", icon: FileCheck },
] as const;

export default function JournalistApplySidebar() {
  const { t } = useTranslation();

  return (
    <aside className="journalist-apply-sidebar">
      <div className="journalist-apply-portal-badge">
        {t("journalistRequest.portalBadge")}
      </div>

      <div className="space-y-4">
        <BrandLogo linkToHome={false} size="lg" />
        <h2 className="font-headline text-3xl font-bold leading-tight text-foreground md:text-4xl">
          {t("journalistRequest.sidebarTitle")}
        </h2>
        <p className="text-body-md leading-relaxed text-muted-foreground">
          {t("journalistRequest.sidebarDescription")}
        </p>
      </div>

      <ul className="space-y-4">
        {SIDEBAR_FEATURES.map(({ key, icon: Icon }) => (
          <li key={key} className="flex items-start gap-3">
            <div className="journalist-apply-feature-icon">
              <Icon className="size-4" />
            </div>
            <div>
              <p className="font-headline text-base font-semibold text-foreground">
                {t(`journalistRequest.features.${key}.title`)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(`journalistRequest.features.${key}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="journalist-apply-visual">
        <div className="journalist-apply-visual-inner">
          <span className="journalist-apply-visual-meem" aria-hidden>
            م
          </span>
          <div className="journalist-apply-visual-copy">
            <p className="text-label-caps text-secondary">
              {t("journalistRequest.visual.label")}
            </p>
            <p className="mt-2 font-headline text-lg font-semibold text-foreground">
              {t("journalistRequest.visual.title")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("journalistRequest.visual.caption")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
