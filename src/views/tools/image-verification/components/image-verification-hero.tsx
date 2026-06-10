import BrandLogo from "@/components/brand-logo";
import type { ImageVerificationMode } from "@/types/image-verification";
import { useTranslation } from "react-i18next";

interface ImageVerificationHeroProps {
  mode: ImageVerificationMode;
}

export default function ImageVerificationHero({ mode }: ImageVerificationHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-4 md:gap-5">
      <BrandLogo
        linkToHome={false}
        variant="icon"
        size="lg"
        imageClassName="rounded-lg border border-border/70 bg-card p-2 shadow-sm"
      />
      <div className="max-w-2xl space-y-2">
        <p className="text-label-caps text-[var(--investigation-amber)]">
          {t("imageVerification.heroLabel")}
        </p>
        <h1 className="text-display-lg leading-tight">{t("imageVerification.title")}</h1>
        <p className="text-body-md text-muted-foreground md:text-body-lg">
          {mode === "reverse"
            ? t("imageVerification.reverseDescription")
            : t("imageVerification.aiDescription")}
        </p>
      </div>
    </div>
  );
}
